import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListQueryDto } from '../common/dto/list-query.dto.js';
import { CounterpartiesService } from './counterparties.service.js';
import { CreateCounterpartyDto } from './dto/create-counterparty.dto.js';
import { UpdateCounterpartyDto } from './dto/update-counterparty.dto.js';

@ApiTags('Counterparties')
@Controller('counterparties')
export class CounterpartiesController {
  constructor(private readonly counterparties: CounterpartiesService) {}

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.counterparties.findAll(query.includeArchived);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.counterparties.findOne(id);
  }

  @Get(':id/entries')
  findEntries(@Param('id', ParseIntPipe) id: number) {
    return this.counterparties.findEntries(id);
  }

  @Post()
  create(@Body() dto: CreateCounterpartyDto) {
    return this.counterparties.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCounterpartyDto,
  ) {
    return this.counterparties.update(id, dto);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.counterparties.archive(id);
  }
}
