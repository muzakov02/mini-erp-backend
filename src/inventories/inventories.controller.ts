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
import { InventoryDocumentDto } from './dto/inventory-document.dto.js';
import { InventoriesService } from './inventories.service.js';

@ApiTags('Inventories')
@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventories: InventoriesService) {}

  @Get()
  findAll(@Query() query: DocumentQueryDto) {
    return this.inventories.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventories.findOne(id);
  }

  @Post()
  create(@Body() dto: InventoryDocumentDto) {
    return this.inventories.create(dto);
  }

  @Put(':id')
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InventoryDocumentDto,
  ) {
    return this.inventories.replace(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventories.remove(id);
  }

  @Post(':id/post')
  @HttpCode(HttpStatus.OK)
  post(@Param('id', ParseIntPipe) id: number) {
    return this.inventories.post(id);
  }
}
