import { Module } from '@nestjs/common';
import { StockModule } from '../stock/stock.module.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [StockModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
