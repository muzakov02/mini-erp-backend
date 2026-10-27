import { Module } from '@nestjs/common';
import { CashModule } from '../cash/cash.module.js';
import { DocumentsModule } from '../documents/documents.module.js';
import { StockModule } from '../stock/stock.module.js';
import { PurchasesController } from './purchases.controller.js';
import { PurchasesService } from './purchases.service.js';

@Module({
  imports: [DocumentsModule, StockModule, CashModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
