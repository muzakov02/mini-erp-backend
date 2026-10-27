import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception.js';
import { ErrorCode } from '../common/exceptions/error-code.js';
import { toDbDate } from '../common/utils/date.js';
import { MONEY_DP, round, toUnits } from '../documents/costing.js';
import { documentWhere, LIST_ORDER } from '../documents/document-filter.js';
import {
  DocumentReferencesService,
  uniqueSorted,
} from '../documents/document-references.service.js';
import {
  DOCUMENT_TX_OPTIONS,
  documentNotDraft,
  documentNotFound,
  draftStateError,
  lockDocument,
  lockProducts,
} from '../documents/document-tx.js';
import { DocumentQueryDto } from '../documents/dto/document-query.dto.js';
import { TradeDocumentDto } from '../documents/dto/trade-document.dto.js';
import {
  assertCounterpartyForDebt,
  buildTradeDraft,
  tradeReferences,
  type TradeDraft,
} from '../documents/trade-draft.js';
import {
  CashCategory,
  CashDirection,
  CounterpartySource,
  DocumentStatus,
  Prisma,
  StockSource,
  type Product,
  type SaleItem,
  type Warehouse,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { locationKey, StockService } from '../stock/stock.service.js';

const ENTITY = 'Sale';

const NAME_SELECT = { select: { id: true, name: true } };

const DETAIL_INCLUDE = {
  counterparty: NAME_SELECT,
  items: {
    orderBy: { id: 'asc' },
    include: { product: NAME_SELECT, warehouse: NAME_SELECT },
  },
} satisfies Prisma.SaleInclude;

interface SaleLine {
  item: SaleItem;
  product: Product;
  qtyInUnits: number;
}

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly refs: DocumentReferencesService,
    private readonly stock: StockService,
  ) {}

  findAll(query: DocumentQueryDto) {
    return this.prisma.sale.findMany({
      where: documentWhere(query),
      include: { counterparty: NAME_SELECT },
      orderBy: LIST_ORDER,
    });
  }

  async findOne(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: DETAIL_INCLUDE,
    });
    if (!sale) {
      throw documentNotFound(ENTITY, id);
    }
    return sale;
  }

  async create(dto: TradeDocumentDto) {
    const { products } = await this.refs.assertActive(tradeReferences(dto));
    const draft = buildTradeDraft(dto, products);
    const sale = await this.prisma.sale.create({
      data: { ...this.header(dto, draft), items: { create: draft.items } },
    });
    return this.findOne(sale.id);
  }

  async replace(id: number, dto: TradeDocumentDto) {
    const { products } = await this.refs.assertActive(tradeReferences(dto));
    const draft = buildTradeDraft(dto, products);
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.sale.updateMany({
        where: { id, status: DocumentStatus.DRAFT },
        data: this.header(dto, draft),
      });
      if (updated.count === 0) {
        throw draftStateError(
          ENTITY,
          id,
          await tx.sale.findUnique({ where: { id }, select: { status: true } }),
        );
      }
      await tx.saleItem.deleteMany({ where: { saleId: id } });
      await tx.saleItem.createMany({
        data: draft.items.map((item) => ({ ...item, saleId: id })),
      });
    }, DOCUMENT_TX_OPTIONS);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.prisma.sale.deleteMany({
      where: { id, status: DocumentStatus.DRAFT },
    });
    if (deleted.count === 0) {
      throw draftStateError(
        ENTITY,
        id,
        await this.prisma.sale.findUnique({
          where: { id },
          select: { status: true },
        }),
      );
    }
  }

  async post(id: number) {
    await this.prisma.$transaction(async (tx) => {
      if (!(await lockDocument(tx, 'sales', id))) {
        throw documentNotFound(ENTITY, id);
      }
      const sale = await tx.sale.findUniqueOrThrow({
        where: { id },
        include: { items: { orderBy: { id: 'asc' } } },
      });
      const productIds = uniqueSorted(sale.items.map((item) => item.productId));
      await lockProducts(tx, productIds);

      const claimed = await tx.sale.updateMany({
        where: { id, status: DocumentStatus.DRAFT },
        data: { status: DocumentStatus.POSTED, postedAt: new Date() },
      });
      if (claimed.count === 0) {
        throw documentNotDraft(ENTITY, id, sale.status);
      }

      const { products, warehouses } = await this.refs.assertActive(
        {
          productIds,
          warehouseIds: sale.items.map((item) => item.warehouseId),
          counterpartyId: sale.counterpartyId,
        },
        tx,
      );
      const unpaid = sale.totalAmount.sub(sale.paidAmount);
      assertCounterpartyForDebt(unpaid, sale.counterpartyId);

      const lines: SaleLine[] = sale.items.map((item) => {
        const product = products.get(item.productId)!;
        return {
          item,
          product,
          qtyInUnits: toUnits(
            item.unitType,
            item.quantity,
            product.unitsPerBlock,
          ),
        };
      });
      await this.assertStock(lines, productIds, warehouses, tx);

      let totalCost = new Prisma.Decimal(0);
      const movements: Prisma.StockMovementCreateManyInput[] = [];
      for (const { item, product, qtyInUnits } of lines) {
        const unitCost = product.avgCost;
        const costAmount = round(unitCost.mul(qtyInUnits), MONEY_DP);
        totalCost = totalCost.add(costAmount);
        await tx.saleItem.update({
          where: { id: item.id },
          data: { qtyInUnits, unitCost, costAmount },
        });
        movements.push({
          productId: item.productId,
          warehouseId: item.warehouseId,
          quantity: -qtyInUnits,
          unitCost,
          sourceType: StockSource.SALE,
          sourceId: id,
          date: sale.date,
        });
      }
      await tx.stockMovement.createMany({ data: movements });
      await tx.sale.update({ where: { id }, data: { totalCost } });

      if (sale.paidAmount.gt(0)) {
        await tx.cashOperation.create({
          data: {
            date: sale.date,
            direction: CashDirection.IN,
            category: CashCategory.SALE_PAYMENT,
            amount: sale.paidAmount,
            counterpartyId: sale.counterpartyId,
            sourceType: CounterpartySource.SALE,
            sourceId: id,
          },
        });
      }
      if (unpaid.gt(0)) {
        await tx.counterpartyEntry.create({
          data: {
            counterpartyId: sale.counterpartyId!,
            amount: unpaid,
            sourceType: CounterpartySource.SALE,
            sourceId: id,
            date: sale.date,
          },
        });
      }
    }, DOCUMENT_TX_OPTIONS);
    return this.findOne(id);
  }

  private async assertStock(
    lines: SaleLine[],
    productIds: number[],
    warehouses: Map<number, Warehouse>,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const requested = new Map<
      string,
      { product: Product; warehouseId: number; qty: number }
    >();
    for (const { item, product, qtyInUnits } of lines) {
      const key = locationKey(item.productId, item.warehouseId);
      const entry = requested.get(key);
      if (entry) {
        entry.qty += qtyInUnits;
      } else {
        requested.set(key, {
          product,
          warehouseId: item.warehouseId,
          qty: qtyInUnits,
        });
      }
    }

    const available = await this.stock.getQtyByLocation(productIds, tx);
    const shortages = [...requested.entries()]
      .map(([key, entry]) => ({ entry, available: available.get(key) ?? 0 }))
      .filter(({ entry, available }) => available < entry.qty)
      .map(({ entry, available }) => ({
        productId: entry.product.id,
        productName: entry.product.name,
        warehouseId: entry.warehouseId,
        warehouseName: warehouses.get(entry.warehouseId)!.name,
        available,
        requested: entry.qty,
      }));
    if (shortages.length > 0) {
      throw new AppException(
        ErrorCode.INSUFFICIENT_STOCK,
        'Insufficient stock',
        undefined,
        { items: shortages },
      );
    }
  }

  private header(dto: TradeDocumentDto, draft: TradeDraft) {
    return {
      date: toDbDate(dto.date),
      counterpartyId: dto.counterpartyId ?? null,
      paidAmount: draft.paidAmount,
      totalAmount: draft.totalAmount,
      note: dto.note ?? null,
    };
  }
}
