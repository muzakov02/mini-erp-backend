import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { IsDateOnly } from '../../common/validation/decorators.js';
import { CashCategory } from '../../generated/prisma/client.js';

export class CashQueryDto {
  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsOptional()
  @IsDateOnly()
  from?: string;

  @ApiPropertyOptional({ example: '2026-10-31' })
  @IsOptional()
  @IsDateOnly()
  to?: string;

  @ApiPropertyOptional({ enum: CashCategory })
  @IsOptional()
  @IsEnum(CashCategory)
  category?: CashCategory;
}
