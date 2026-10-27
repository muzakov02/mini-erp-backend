import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception.js';
import { ErrorCode } from '../common/exceptions/error-code.js';
import { toDbDate } from '../common/utils/date.js';
import { MONEY_DP, round, weightedAvgCost } from '../documents/costing.js';
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
import {
  DocumentStatus,
  InventoryType,
  Prisma,
  StockSource,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StockService } from '../stock/stock.service.js';
import { InventoryDocumentDto } from './dto/inventory-document.dto.js';

const ENTITY = 'Inventory';

const NAME_SELECT = { select: { id: true, name: true } };

const DETAIL_INCLUDE = {
  warehouse: NAME_SELECT,
  items: { orderBy: { id: 'asc' }, include: { product: NAME_SELECT } },
} satisfies Prisma.InventoryInclude;

@Injectable()
export class InventoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly refs: DocumentReferencesService,
    private readonly stock: StockService,
  ) {}

  findAll(query: DocumentQueryDto) {
    return this.prisma.inventory.findMany({
      where: documentWhere(query),
      include: { warehouse: NAME_SELECT },
      orderBy: LIST_ORDER,
    });
  }

  async findOne(id: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: DETAIL_INCLUDE,
    });
    if (!inventory) {
      throw documentNotFound(ENTITY, id);
    }
    return inventory;
  }

  async create(dto: InventoryDocumentDto) {
    await this.validateDraft(dto);
    const inventory = await this.prisma.inventory.create({
      data: { ...this.header(dto), items: { create: this.draftItems(dto) } },
    });
    return this.findOne(inventory.id);
  }

  async replace(id: number, dto: InventoryDocumentDto) {
    await this.validateDraft(dto);
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.inventory.updateMany({
        where: { id, status: DocumentStatus.DRAFT },
        data: this.header(dto),
      });
      if (updated.count === 0) {
        throw draftStateError(
          ENTITY,
          id,
          await tx.inventory.findUnique({
            where: { id },
            select: { status: true },
          }),
        );
      }
      await tx.inventoryItem.deleteMany({ where: { inventoryId: id } });
      await tx.inventoryItem.createMany({
        data: this.draftItems(dto).map((item) => ({
          ...item,
          inventoryId: id,
        })),
      });
    }, DOCUMENT_TX_OPTIONS);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.prisma.inventory.deleteMany({
      where: { id, status: DocumentStatus.DRAFT },
    });
    if (deleted.count === 0) {
      throw draftStateError(
        ENTITY,
        id,
        await this.prisma.inventory.findUnique({
          where: { id },
          select: { status: true },
        }),
      );
    }
  }

  async post(id: number) {
    await this.prisma.$transaction(async (tx) => {
      if (!(await lockDocument(tx, 'inventories', id))) {
        throw documentNotFound(ENTITY, id);
      }
      const inventory = await tx.inventory.findUniqueOrThrow({
        where: { id },
        include: { items: { orderBy: { id: 'asc' } } },
      });
      const productIds = uniqueSorted(
        inventory.items.map((item) => item.productId),
      );
      await lockProducts(tx, productIds);

      const claimed = await tx.inventory.updateMany({
        where: { id, status: DocumentStatus.DRAFT },
        data: { status: DocumentStatus.POSTED, postedAt: new Date() },
      });
      if (claimed.count === 0) {
        throw documentNotDraft(ENTITY, id, inventory.status);
      }

      const { products } = await this.refs.assertActive(
        { productIds, warehouseIds: [inventory.warehouseId] },
        tx,
      );
      const expectedQty = await this.stock.getQtyByProduct(
        { productIds, warehouseId: inventory.warehouseId },
        tx,
      );
      const isOpening = inventory.type === InventoryType.OPENING;

      if (isOpening) {
        const existing = inventory.items
          .map((item) => ({
            productId: item.productId,
            productName: products.get(item.productId)!.name,
            expectedQty: expectedQty.get(item.productId) ?? 0,
          }))
          .filter((item) => item.expectedQty !== 0);
        if (existing.length > 0) {
          throw new AppException(
            ErrorCode.OPENING_STOCK_EXISTS,
            'Opening stock already exists in this warehouse',
            undefined,
            { warehouseId: inventory.warehouseId, items: existing },
          );
        }
      }

      const totalQty = isOpening
        ? await this.stock.getQtyByProduct({ productIds }, tx)
        : new Map<number, number>();
      let totalDiffAmount = new Prisma.Decimal(0);
      const movements: Prisma.StockMovementCreateManyInput[] = [];

      for (const item of inventory.items) {
        const product = products.get(item.productId)!;
        const expected = expectedQty.get(item.productId) ?? 0;
        const diffQty = item.countedQty - expected;
        const unitCost = isOpening ? item.unitCost : product.avgCost;
        if (unitCost === null) {
          throw new AppException(
            ErrorCode.VALIDATION_ERROR,
            'unitCost is required for OPENING inventory',
            undefined,
            { productId: item.productId },
          );
        }
        const diffAmount = round(unitCost.mul(diffQty), MONEY_DP);
        totalDiffAmount = totalDiffAmount.add(diffAmount);

        if (isOpening && item.countedQty > 0) {
          const currentQty = totalQty.get(item.productId) ?? 0;
          await tx.product.update({
            where: { id: item.productId },
            data: {
              avgCost: weightedAvgCost(
                currentQty,
                product.avgCost,
                item.countedQty,
                unitCost,
              ),
            },
          });
        }
        if (diffQty !== 0) {
          movements.push({
            productId: item.productId,
            warehouseId: inventory.warehouseId,
            quantity: diffQty,
            unitCost,
            sourceType: StockSource.INVENTORY,
            sourceId: id,
            date: inventory.date,
          });
        }
        await tx.inventoryItem.update({
          where: { id: item.id },
          data: { expectedQty: expected, diffQty, unitCost, diffAmount },
        });
      }

      if (movements.length > 0) {
        await tx.stockMovement.createMany({ data: movements });
      }
      await tx.inventory.update({
        where: { id },
        data: { totalDiffAmount },
      });
    }, DOCUMENT_TX_OPTIONS);
    return this.findOne(id);
  }

  private async validateDraft(dto: InventoryDocumentDto): Promise<void> {
    const isOpening = dto.type === InventoryType.OPENING;
    const invalid = dto.items
      .map((item, index) => ({ index, productId: item.productId, item }))
      .filter(({ item }) =>
        isOpening ? item.unitCost === undefined : item.unitCost !== undefined,
      )
      .map(({ index, productId }) => ({ index, productId }));
    if (invalid.length > 0) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        isOpening
          ? 'unitCost is required for every OPENING item'
          : 'unitCost must not be provided for REGULAR inventory',
        undefined,
        { items: invalid },
      );
    }
    await this.refs.assertActive({
      productIds: dto.items.map((item) => item.productId),
      warehouseIds: [dto.warehouseId],
    });
  }

  private header(dto: InventoryDocumentDto) {
    return {
      date: toDbDate(dto.date),
      type: dto.type,
      warehouseId: dto.warehouseId,
      note: dto.note ?? null,
    };
  }

  private draftItems(dto: InventoryDocumentDto) {
    return dto.items.map((item) => ({
      productId: item.productId,
      countedQty: item.countedQty,
      unitCost:
        item.unitCost !== undefined ? new Prisma.Decimal(item.unitCost) : null,
    }));
  }
}
