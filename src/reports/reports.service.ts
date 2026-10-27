import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception.js';
import { ErrorCode } from '../common/exceptions/error-code.js';
import { MONEY_DP, round } from '../documents/costing.js';
import { dateRange, LIST_ORDER } from '../documents/document-filter.js';
import {
  CashCategory,
  DocumentStatus,
  InventoryType,
  Prisma,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { locationKey, StockService } from '../stock/stock.service.js';
import { ReportRangeDto } from './dto/report-range.dto.js';

const ZERO = new Prisma.Decimal(0);

function orZero(value: Prisma.Decimal | null | undefined): Prisma.Decimal {
  return value ?? ZERO;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
  ) {}

  async stockReport(warehouseId?: number) {
    const warehouses = await this.prisma.warehouse.findMany({
      include: { parent: { select: { id: true, name: true } } },
      orderBy: { id: 'asc' },
    });

    let scope: Set<number> | null = null;
    if (warehouseId !== undefined) {
      const selected = warehouses.find((w) => w.id === warehouseId);
      if (!selected) {
        throw new AppException(
          ErrorCode.NOT_FOUND,
          `Warehouse ${warehouseId} not found`,
        );
      }
      scope = new Set(
        selected.parentId === null
          ? [
              selected.id,
              ...warehouses
                .filter((w) => w.parentId === selected.id)
                .map((w) => w.id),
            ]
          : [selected.id],
      );
    }
    const scoped = scope
      ? warehouses.filter((w) => scope.has(w.id))
      : warehouses;

    const products = await this.prisma.product.findMany({
      where: { isArchived: false },
      orderBy: { name: 'asc' },
    });
    const qtyByLocation = await this.stock.getQtyByLocation(
      products.map((product) => product.id),
    );

    let totalStockValue = ZERO;
    const items = products.map((product) => {
      const locations = scoped
        .map((warehouse) => ({
          warehouse,
          qty: qtyByLocation.get(locationKey(product.id, warehouse.id)) ?? 0,
        }))
        .filter(({ qty }) => qty !== 0);
      const total = locations.reduce((sum, { qty }) => sum + qty, 0);
      const stockValue = round(product.avgCost.mul(total), MONEY_DP);
      totalStockValue = totalStockValue.add(stockValue);
      return {
        productId: product.id,
        name: product.name,
        unitsPerBlock: product.unitsPerBlock,
        avgCost: product.avgCost,
        total: this.stock.formatQty(total, product.unitsPerBlock),
        stockValue,
        locations: locations.map(({ warehouse, qty }) => ({
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          parentId: warehouse.parentId,
          parentName: warehouse.parent?.name ?? null,
          qty: this.stock.formatQty(qty, product.unitsPerBlock),
        })),
      };
    });

    return { items, totalStockValue };
  }

  async salesReport(range: ReportRangeDto) {
    const where = {
      status: DocumentStatus.POSTED,
      date: dateRange(range.from, range.to),
    };

    const totals = await this.prisma.sale.aggregate({
      where,
      _count: { _all: true },
      _sum: { totalAmount: true, totalCost: true, paidAmount: true },
    });
    const revenue = orZero(totals._sum.totalAmount);
    const cost = orZero(totals._sum.totalCost);
    const paid = orZero(totals._sum.paidAmount);

    const productRows = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: where },
      _sum: { qtyInUnits: true, amount: true, costAmount: true },
    });
    const products = await this.prisma.product.findMany({
      where: { id: { in: productRows.map((row) => row.productId) } },
    });
    const productById = new Map(products.map((p) => [p.id, p]));
    const byProduct = productRows
      .map((row) => {
        const product = productById.get(row.productId)!;
        const productRevenue = orZero(row._sum.amount);
        const productCost = orZero(row._sum.costAmount);
        return {
          productId: product.id,
          name: product.name,
          qty: this.stock.formatQty(
            row._sum.qtyInUnits ?? 0,
            product.unitsPerBlock,
          ),
          revenue: productRevenue,
          cost: productCost,
          grossProfit: productRevenue.sub(productCost),
        };
      })
      .sort((a, b) => b.revenue.comparedTo(a.revenue));

    const sales = await this.prisma.sale.findMany({
      where,
      include: { counterparty: { select: { name: true } } },
      orderBy: LIST_ORDER,
    });
    const documents = sales.map((sale) => ({
      id: sale.id,
      date: sale.date,
      counterpartyName: sale.counterparty?.name ?? null,
      totalAmount: sale.totalAmount,
      paidAmount: sale.paidAmount,
      unpaid: sale.totalAmount.sub(sale.paidAmount),
    }));

    return {
      summary: {
        count: totals._count._all,
        revenue,
        cost,
        grossProfit: revenue.sub(cost),
        paid,
        unpaid: revenue.sub(paid),
      },
      byProduct,
      documents,
    };
  }

  async pnlReport(range: ReportRangeDto) {
    const date = dateRange(range.from, range.to);

    const sales = await this.prisma.sale.aggregate({
      where: { status: DocumentStatus.POSTED, date },
      _sum: { totalAmount: true, totalCost: true },
    });
    const revenue = orZero(sales._sum.totalAmount);
    const cogs = orZero(sales._sum.totalCost);
    const grossProfit = revenue.sub(cogs);

    const cashRows = await this.prisma.cashOperation.groupBy({
      by: ['category'],
      where: { date },
      _sum: { amount: true },
    });
    const cash = new Map(
      cashRows.map((row) => [row.category, orZero(row._sum.amount)]),
    );
    const byCategory = (category: CashCategory) => cash.get(category) ?? ZERO;

    const regularItems = {
      inventory: {
        status: DocumentStatus.POSTED,
        type: InventoryType.REGULAR,
        date,
      },
    };
    const shortageAgg = await this.prisma.inventoryItem.aggregate({
      where: { ...regularItems, diffAmount: { lt: 0 } },
      _sum: { diffAmount: true },
    });
    const surplusAgg = await this.prisma.inventoryItem.aggregate({
      where: { ...regularItems, diffAmount: { gt: 0 } },
      _sum: { diffAmount: true },
    });
    const shortage = orZero(shortageAgg._sum.diffAmount);
    const surplus = orZero(surplusAgg._sum.diffAmount);
    const inventoryDiffTotal = shortage.add(surplus);

    const opening = await this.prisma.inventory.aggregate({
      where: {
        status: DocumentStatus.POSTED,
        type: InventoryType.OPENING,
        date,
      },
      _sum: { totalDiffAmount: true },
    });

    const otherIncome = byCategory(CashCategory.OTHER_INCOME);
    const transport = byCategory(CashCategory.EXPENSE_TRANSPORT);
    const rent = byCategory(CashCategory.EXPENSE_RENT);
    const other = byCategory(CashCategory.EXPENSE_OTHER);
    const expensesTotal = transport.add(rent).add(other);

    return {
      revenue,
      cogs,
      grossProfit,
      otherIncome,
      expenses: { transport, rent, other, total: expensesTotal },
      inventoryDiff: { shortage, surplus, total: inventoryDiffTotal },
      netProfit: grossProfit
        .add(otherIncome)
        .sub(expensesTotal)
        .add(inventoryDiffTotal),
      excludedFromPnl: {
        customerDebtPayments: byCategory(CashCategory.CUSTOMER_DEBT_PAYMENT),
        loansReturned: byCategory(CashCategory.LOAN_RETURNED),
        loansTaken: byCategory(CashCategory.LOAN_TAKEN),
        loansGiven: byCategory(CashCategory.LOAN_GIVEN),
        loansRepaid: byCategory(CashCategory.LOAN_REPAID),
        supplierPayments: byCategory(CashCategory.SUPPLIER_PAYMENT),
        ownerWithdrawals: byCategory(CashCategory.OWNER_WITHDRAWAL),
        openingBalance: byCategory(CashCategory.OPENING_BALANCE),
        openingStockValue: orZero(opening._sum.totalDiffAmount),
      },
    };
  }
}
