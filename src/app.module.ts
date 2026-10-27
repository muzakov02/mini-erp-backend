import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CashModule } from './cash/cash.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { DecimalSerializerInterceptor } from './common/interceptors/decimal-serializer.interceptor.js';
import { createValidationPipe } from './common/pipes/app-validation.pipe.js';
import { CounterpartiesModule } from './counterparties/counterparties.module.js';
import { InventoriesModule } from './inventories/inventories.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProductsModule } from './products/products.module.js';
import { PurchasesModule } from './purchases/purchases.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { SalesModule } from './sales/sales.module.js';
import { WarehousesModule } from './warehouses/warehouses.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProductsModule,
    WarehousesModule,
    CounterpartiesModule,
    SalesModule,
    PurchasesModule,
    InventoriesModule,
    CashModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_PIPE, useFactory: createValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: DecimalSerializerInterceptor },
  ],
})
export class AppModule {}
