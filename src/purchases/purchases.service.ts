import { Injectable } from '@nestjs/common';
import { CashService } from '../cash/cash.service.js';
import { AppException } from '../common/exceptions/app.exception.js';
import { ErrorCode } from '../common/exceptions/error-code.js';
import { toDbDate } from '../common/utils/date.js';
import {
  MONEY_DP,
  toUnits,
  unitCostOf,
  weightedAvgCost,
} from '../documents/costing.js';
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
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StockService } from '../stock/stock.service.js';

const ENTITY = 'Purchase';

const NAME_SELECT = { select: { id: true, name: true } };

const DETAIL_INCLUDE = {
  counterparty: NAME_SELECT,
  items: {
    orderBy: { id: 'asc' },
    include: { product: NAME_SELECT, warehouse: NAME_SELECT },
  },
} satisfies Prisma.PurchaseInclude;

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly refs: DocumentReferencesService,
    private readonly stock: StockService,
    private readonly cash: CashService,
  ) {}

  findAll(query: DocumentQueryDto) {
    return this.prisma.purchase.findMany({
      where: documentWhere(query),
      include: { counterparty: NAME_SELECT },
      orderBy: LIST_ORDER,
    });
  }

  async findOne(id: number) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: DETAIL_INCLUDE,
    });
    if (!purchase) {
      throw documentNotFound(ENTITY, id);
    }
    return purchase;
  }

  async create(dto: TradeDocumentDto) {
    const { products } = await this.refs.assertActive(tradeReferences(dto));
    const draft = buildTradeDraft(dto, products);
    const purchase = await this.prisma.purchase.create({
      data: {
        ...this.header(dto, draft),
        items: {
          create: draft.items.map((item) =>
            this.draftItem(item, products.get(item.productId)!),
          ),
        },
      },
    });
    return this.findOne(purchase.id);
  }

  async replace(id: number, dto: TradeDocumentDto) {
    const { products } = await this.refs.assertActive(tradeReferences(dto));
    const draft = buildTradeDraft(dto, products);
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.purchase.updateMany({
        where: { id, status: DocumentStatus.DRAFT },
        data: this.header(dto, draft),
      });
      if (updated.count === 0) {
        throw draftStateError(
          ENTITY,
          id,
          await tx.purchase.findUnique({
            where: { id },
            select: { status: true },
          }),
        );
      }
      await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });
      await tx.purchaseItem.createMany({
        data: draft.items.map((item) => ({
          ...this.draftItem(item, products.get(item.productId)!),
          purchaseId: id,
        })),
      });
    }, DOCUMENT_TX_OPTIONS);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.prisma.purchase.deleteMany({
      where: { id, status: DocumentStatus.DRAFT },
    });
    if (deleted.count === 0) {
      throw draftStateError(
        ENTITY,
        id,
        await this.prisma.purchase.findUnique({
          where: { id },
          select: { status: true },
        }),
      );
    }
  }

  async post(id: number) {
    await this.prisma.$transaction(async (tx) => {
      if (!(await lockDocument(tx, 'purchases', id))) {
        throw documentNotFound(ENTITY, id);
      }
      const purchase = await tx.purchase.findUniqueOrThrow({
        where: { id },
        include: { items: { orderBy: { id: 'asc' } } },
      });
      const productIds = uniqueSorted(
        purchase.items.map((item) => item.productId),
      );
      await lockProducts(tx, productIds);

      const claimed = await tx.purchase.updateMany({
        where: { id, status: DocumentStatus.DRAFT },
        data: { status: DocumentStatus.POSTED, postedAt: new Date() },
      });
      if (claimed.count === 0) {
        throw documentNotDraft(ENTITY, id, purchase.status);
      }

      const { products } = await this.refs.assertActive(
        {
          productIds,
          warehouseIds: purchase.items.map((item) => item.warehouseId),
          counterpartyId: purchase.counterpartyId,
        },
        tx,
      );
      const unpaid = purchase.totalAmount.sub(purchase.paidAmount);
      assertCounterpartyForDebt(unpaid, purchase.counterpartyId);

      const totalQty = await this.stock.getQtyByProduct({ productIds }, tx);
      const avgCost = new Map(
        [...products.values()].map((product) => [product.id, product.avgCost]),
      );
      const movements: Prisma.StockMovementCreateManyInput[] = [];
      for (const item of purchase.items) {
        const product = products.get(item.productId)!;
        const qtyInUnits = toUnits(
          item.unitType,
          item.quantity,
          product.unitsPerBlock,
        );
        const unitCost = unitCostOf(
          item.unitType,
          item.price,
          product.unitsPerBlock,
        );
        const currentQty = totalQty.get(item.productId) ?? 0;
        avgCost.set(
          item.productId,
          weightedAvgCost(
            currentQty,
            avgCost.get(item.productId)!,
            qtyInUnits,
            unitCost,
          ),
        );
        totalQty.set(item.productId, currentQty + qtyInUnits);

        await tx.purchaseItem.update({
          where: { id: item.id },
          data: { qtyInUnits, unitCost },
        });
        movements.push({
          productId: item.productId,
          warehouseId: item.warehouseId,
          quantity: qtyInUnits,
          unitCost,
          sourceType: StockSource.PURCHASE,
          sourceId: id,
          date: purchase.date,
        });
      }
      for (const productId of productIds) {
        await tx.product.update({
          where: { id: productId },
          data: { avgCost: avgCost.get(productId)! },
        });
      }
      await tx.stockMovement.createMany({ data: movements });

      if (purchase.paidAmount.gt(0)) {
        await this.cash.lock(tx);
        const balance = await this.cash.getBalance(tx);
        if (balance.lt(purchase.paidAmount)) {
          throw new AppException(
            ErrorCode.INSUFFICIENT_CASH,
            'Insufficient cash balance',
            undefined,
            {
              balance: balance.toFixed(MONEY_DP),
              required: purchase.paidAmount.toFixed(MONEY_DP),
            },
          );
        }
        await tx.cashOperation.create({
          data: {
            date: purchase.date,
            direction: CashDirection.OUT,
            category: CashCategory.PURCHASE_PAYMENT,
            amount: purchase.paidAmount,
            counterpartyId: purchase.counterpartyId,
            sourceType: CounterpartySource.PURCHASE,
            sourceId: id,
          },
        });
      }
      if (unpaid.gt(0)) {
        await tx.counterpartyEntry.create({
          data: {
            counterpartyId: purchase.counterpartyId!,
            amount: unpaid.neg(),
            sourceType: CounterpartySource.PURCHASE,
            sourceId: id,
            date: purchase.date,
          },
        });
      }
    }, DOCUMENT_TX_OPTIONS);
    return this.findOne(id);
  }

  private draftItem(item: TradeDraft['items'][number], product: Product) {
    return {
      ...item,
      unitCost: unitCostOf(item.unitType, item.price, product.unitsPerBlock),
    };
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
