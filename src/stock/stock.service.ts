import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface FormattedQty {
  units: number;
  blocks: number;
  remainder: number;
}

export interface QtyFilter {
  productIds?: number[];
  warehouseId?: number;
}

export function locationKey(productId: number, warehouseId: number): string {
  return `${productId}:${warehouseId}`;
}

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async getQty(
    productId: number,
    warehouseId?: number,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<number> {
    const result = await db.stockMovement.aggregate({
      where: { productId, warehouseId },
      _sum: { quantity: true },
    });
    return result._sum.quantity ?? 0;
  }

  async getQtyByProduct(
    filter: QtyFilter = {},
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<Map<number, number>> {
    const rows = await db.stockMovement.groupBy({
      by: ['productId'],
      where: {
        productId: filter.productIds ? { in: filter.productIds } : undefined,
        warehouseId: filter.warehouseId,
      },
      _sum: { quantity: true },
    });
    return new Map(rows.map((row) => [row.productId, row._sum.quantity ?? 0]));
  }

  async getQtyByLocation(
    productIds: number[],
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<Map<string, number>> {
    const rows = await db.stockMovement.groupBy({
      by: ['productId', 'warehouseId'],
      where: { productId: { in: productIds } },
      _sum: { quantity: true },
    });
    return new Map(
      rows.map((row) => [
        locationKey(row.productId, row.warehouseId),
        row._sum.quantity ?? 0,
      ]),
    );
  }

  formatQty(qty: number, unitsPerBlock: number): FormattedQty {
    const sign = qty < 0 ? -1 : 1;
    const abs = Math.abs(qty);
    return {
      units: qty,
      blocks: sign * Math.floor(abs / unitsPerBlock),
      remainder: sign * (abs % unitsPerBlock),
    };
  }
}
