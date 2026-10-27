import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CashService } from './cash.service.js';
import { CashQueryDto } from './dto/cash-query.dto.js';
import { CreateCashOperationDto } from './dto/create-cash-operation.dto.js';

@ApiTags('Cash')
@Controller('cash')
export class CashController {
  constructor(private readonly cash: CashService) {}

  @Get('categories')
  getCategories() {
    return this.cash.getCategories();
  }

  @Get('operations')
  findAll(@Query() query: CashQueryDto) {
    return this.cash.findAll(query);
  }

  @Post('operations')
  create(@Body() dto: CreateCashOperationDto) {
    return this.cash.create(dto);
  }

  @Get('balance')
  async getBalance() {
    return { balance: await this.cash.getBalance() };
  }
}
