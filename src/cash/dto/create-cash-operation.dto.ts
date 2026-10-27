import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  IsNotFutureDate,
  IsPositiveMoney,
  MONEY_PATTERN,
  Trim,
} from '../../common/validation/decorators.js';
import { CashCategory } from '../../generated/prisma/client.js';

export class CreateCashOperationDto {
  @ApiProperty({ example: '2026-10-27', description: 'Not later than today' })
  @IsNotFutureDate()
  date: string;

  @ApiProperty({ enum: CashCategory, example: CashCategory.EXPENSE_TRANSPORT })
  @IsEnum(CashCategory)
  category: CashCategory;

  @ApiProperty({ example: '40000.00', pattern: MONEY_PATTERN.source })
  @IsPositiveMoney()
  amount: string;

  @ApiPropertyOptional({ example: 1, nullable: true, type: Number })
  @IsOptional()
  @IsInt()
  @Min(1)
  counterpartyId?: number | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @Trim()
  @IsString()
  note?: string | null;
}
