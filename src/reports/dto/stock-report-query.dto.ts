import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class StockReportQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Root warehouse includes its sub-warehouses',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  warehouseId?: number;
}
