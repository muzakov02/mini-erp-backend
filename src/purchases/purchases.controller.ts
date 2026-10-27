import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentQueryDto } from '../documents/dto/document-query.dto.js';
import { TradeDocumentDto } from '../documents/dto/trade-document.dto.js';
import { PurchasesService } from './purchases.service.js';

@ApiTags('Purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchases: PurchasesService) {}

  @Get()
  findAll(@Query() query: DocumentQueryDto) {
    return this.purchases.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchases.findOne(id);
  }

  @Post()
  create(@Body() dto: TradeDocumentDto) {
    return this.purchases.create(dto);
  }

  @Put(':id')
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TradeDocumentDto,
  ) {
    return this.purchases.replace(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.purchases.remove(id);
  }

  @Post(':id/post')
  @HttpCode(HttpStatus.OK)
  post(@Param('id', ParseIntPipe) id: number) {
    return this.purchases.post(id);
  }
}
