import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module.js';
import { StockModule } from '../stock/stock.module.js';
import { InventoriesController } from './inventories.controller.js';
import { InventoriesService } from './inventories.service.js';

@Module({
  imports: [DocumentsModule, StockModule],
  controllers: [InventoriesController],
  providers: [InventoriesService],
})
export class InventoriesModule {}
