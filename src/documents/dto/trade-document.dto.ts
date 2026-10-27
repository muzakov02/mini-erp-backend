import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  IsMoney,
  IsNotFutureDate,
  MONEY_PATTERN,
  Trim,
} from '../../common/validation/decorators.js';
import { UnitType } from '../../generated/prisma/client.js';

export class TradeItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  warehouseId: number;

  @ApiProperty({ enum: UnitType, example: UnitType.BLOCK })
  @IsEnum(UnitType)
  unitType: UnitType;

  @ApiProperty({ example: 5, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: '66000.00', pattern: MONEY_PATTERN.source })
  @IsMoney()
  price: string;
}

export class TradeDocumentDto {
  @ApiProperty({ example: '2026-10-27', description: 'Not later than today' })
  @IsNotFutureDate()
  date: string;

  @ApiPropertyOptional({ example: 1, nullable: true, type: Number })
  @IsOptional()
  @IsInt()
  @Min(1)
  counterpartyId?: number | null;

  @ApiProperty({ example: '200000.00', pattern: MONEY_PATTERN.source })
  @IsMoney()
  paidAmount: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @Trim()
  @IsString()
  note?: string | null;

  @ApiProperty({ type: [TradeItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TradeItemDto)
  items: TradeItemDto[];
}
