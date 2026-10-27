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
import { SalesService } from './sales.service.js';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Get()
  findAll(@Query() query: DocumentQueryDto) {
    return this.sales.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sales.findOne(id);
  }

  @Post()
  create(@Body() dto: TradeDocumentDto) {
    return this.sales.create(dto);
  }

  @Put(':id')
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TradeDocumentDto,
  ) {
    return this.sales.replace(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sales.remove(id);
  }

  @Post(':id/post')
  @HttpCode(HttpStatus.OK)
  post(@Param('id', ParseIntPipe) id: number) {
    return this.sales.post(id);
  }
}
