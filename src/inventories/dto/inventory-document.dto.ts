import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  COST_PATTERN,
  IsCost,
  IsNotFutureDate,
  Trim,
} from '../../common/validation/decorators.js';
import { InventoryType } from '../../generated/prisma/client.js';

export class InventoryItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ example: 12, minimum: 0 })
  @IsInt()
  @Min(0)
  countedQty: number;

  @ApiPropertyOptional({
    example: '7800.0000',
    pattern: COST_PATTERN.source,
    description: 'Required for OPENING, forbidden for REGULAR',
  })
  @IsOptional()
  @IsCost()
  unitCost?: string;
}

export class InventoryDocumentDto {
  @ApiProperty({ example: '2026-10-27', description: 'Not later than today' })
  @IsNotFutureDate()
  date: string;

  @ApiProperty({ enum: InventoryType, example: InventoryType.REGULAR })
  @IsEnum(InventoryType)
  type: InventoryType;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  warehouseId: number;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @Trim()
  @IsString()
  note?: string | null;

  @ApiProperty({ type: [InventoryItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique((item: InventoryItemDto) => item.productId, {
    message: 'items must not contain the same product twice',
  })
  @ValidateNested({ each: true })
  @Type(() => InventoryItemDto)
  items: InventoryItemDto[];
}
