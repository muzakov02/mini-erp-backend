import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception.js';
import { ErrorCode } from '../common/exceptions/error-code.js';
import type { Prisma, Product, Warehouse } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface ReferenceRequest {
  productIds: number[];
  warehouseIds: number[];
  counterpartyId?: number | null;
}

export interface ActiveReferences {
  products: Map<number, Product>;
  warehouses: Map<number, Warehouse>;
}

interface Archivable {
  id: number;
  isArchived: boolean;
}

function assertAllActive(
  entity: string,
  requestedIds: number[],
  found: Archivable[],
): void {
  const foundIds = new Set(found.map((row) => row.id));
  const missing = requestedIds.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    throw new AppException(
      ErrorCode.NOT_FOUND,
      `${entity} not found`,
      undefined,
      { entity, ids: missing },
    );
  }
  const archived = found.filter((row) => row.isArchived).map((row) => row.id);
  if (archived.length > 0) {
    throw new AppException(
      ErrorCode.ARCHIVED_ENTITY,
      `${entity} is archived`,
      undefined,
      { entity, ids: archived },
    );
  }
}

export function uniqueSorted(ids: number[]): number[] {
  return [...new Set(ids)].sort((a, b) => a - b);
}

@Injectable()
export class DocumentReferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async assertActive(
    request: ReferenceRequest,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<ActiveReferences> {
    const productIds = uniqueSorted(request.productIds);
    const warehouseIds = uniqueSorted(request.warehouseIds);

    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    });
    assertAllActive('Product', productIds, products);

    const warehouses = await db.warehouse.findMany({
      where: { id: { in: warehouseIds } },
    });
    assertAllActive('Warehouse', warehouseIds, warehouses);

    if (
      request.counterpartyId !== undefined &&
      request.counterpartyId !== null
    ) {
      const counterparty = await db.counterparty.findUnique({
        where: { id: request.counterpartyId },
      });
      assertAllActive(
        'Counterparty',
        [request.counterpartyId],
        counterparty ? [counterparty] : [],
      );
    }

    return {
      products: new Map(products.map((product) => [product.id, product])),
      warehouses: new Map(
        warehouses.map((warehouse) => [warehouse.id, warehouse]),
      ),
    };
  }
}
