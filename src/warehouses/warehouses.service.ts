import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception.js';
import { ErrorCode } from '../common/exceptions/error-code.js';
import type { Warehouse } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StockService } from '../stock/stock.service.js';
import { CreateWarehouseDto } from './dto/create-warehouse.dto.js';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto.js';

export type WarehouseNode = Warehouse & { children: Warehouse[] };

@Injectable()
export class WarehousesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
  ) {}

  findTree(includeArchived: boolean): Promise<WarehouseNode[]> {
    const where = includeArchived ? {} : { isArchived: false };
    return this.prisma.warehouse.findMany({
      where: { ...where, parentId: null },
      include: { children: { where, orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateWarehouseDto): Promise<Warehouse> {
    if (dto.parentId !== undefined) {
      const parent = await this.getOrThrow(dto.parentId);
      if (parent.isArchived) {
        throw new AppException(
          ErrorCode.ARCHIVED_ENTITY,
          `Parent warehouse ${parent.id} is archived`,
        );
      }
      if (parent.parentId !== null) {
        throw new AppException(
          ErrorCode.INVALID_WAREHOUSE_LEVEL,
          'Sub-warehouse cannot have its own sub-warehouses',
          undefined,
          { parentId: parent.id },
        );
      }
    }
    return this.prisma.warehouse.create({
      data: { name: dto.name, parentId: dto.parentId },
    });
  }

  update(id: number, dto: UpdateWarehouseDto): Promise<Warehouse> {
    return this.prisma.warehouse.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async archive(id: number): Promise<Warehouse> {
    await this.getOrThrow(id);

    const qtyByProduct = await this.stock.getQtyByProduct({ warehouseId: id });
    const products = [...qtyByProduct]
      .filter(([, qty]) => qty !== 0)
      .map(([productId, qty]) => ({ productId, qty }));
    if (products.length > 0) {
      throw new AppException(
        ErrorCode.HAS_STOCK,
        'Warehouse has stock and cannot be archived',
        undefined,
        { reason: 'WAREHOUSE_HAS_STOCK', products },
      );
    }

    const children = await this.prisma.warehouse.findMany({
      where: { parentId: id, isArchived: false },
      select: { id: true, name: true },
    });
    if (children.length > 0) {
      throw new AppException(
        ErrorCode.HAS_STOCK,
        'Warehouse has active sub-warehouses and cannot be archived',
        undefined,
        { reason: 'HAS_ACTIVE_CHILDREN', children },
      );
    }

    return this.prisma.warehouse.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  private async getOrThrow(id: number): Promise<Warehouse> {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) {
      throw new AppException(ErrorCode.NOT_FOUND, `Warehouse ${id} not found`);
    }
    return warehouse;
  }
}
