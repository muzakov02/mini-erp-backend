import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception.js';
import { ErrorCode } from '../common/exceptions/error-code.js';
import type { Product } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { FormattedQty, StockService } from '../stock/stock.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

export type ProductWithStock = Product & { stock: FormattedQty };

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
  ) {}

  async findAll(includeArchived: boolean): Promise<ProductWithStock[]> {
    const products = await this.prisma.product.findMany({
      where: includeArchived ? undefined : { isArchived: false },
      orderBy: { name: 'asc' },
    });
    const qtyByProduct = await this.stock.getQtyByProduct({
      productIds: products.map((product) => product.id),
    });
    return products.map((product) =>
      this.withStock(product, qtyByProduct.get(product.id) ?? 0),
    );
  }

  async findOne(id: number): Promise<ProductWithStock> {
    const product = await this.getOrThrow(id);
    return this.withStock(product, await this.stock.getQty(id));
  }

  create(dto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({ data: dto });
  }

  update(id: number, dto: UpdateProductDto): Promise<Product> {
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async archive(id: number): Promise<Product> {
    await this.getOrThrow(id);
    const qty = await this.stock.getQty(id);
    if (qty !== 0) {
      throw new AppException(
        ErrorCode.HAS_STOCK,
        'Product has stock and cannot be archived',
        undefined,
        { qty },
      );
    }
    return this.prisma.product.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  private async getOrThrow(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new AppException(ErrorCode.NOT_FOUND, `Product ${id} not found`);
    }
    return product;
  }

  private withStock(product: Product, qty: number): ProductWithStock {
    return {
      ...product,
      stock: this.stock.formatQty(qty, product.unitsPerBlock),
    };
  }
}
