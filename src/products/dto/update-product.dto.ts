import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import {
  IsMoney,
  IsName,
  IsOptionalDefined,
  MONEY_PATTERN,
} from '../../common/validation/decorators.js';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Coca-Cola 1.5L' })
  @IsOptionalDefined()
  @IsName()
  name?: string;

  @ApiPropertyOptional({ example: 6, minimum: 1 })
  @IsOptionalDefined()
  @IsInt()
  @Min(1)
  unitsPerBlock?: number;

  @ApiPropertyOptional({ example: '12000.00', pattern: MONEY_PATTERN.source })
  @IsOptionalDefined()
  @IsMoney()
  salePriceUnit?: string;

  @ApiPropertyOptional({ example: '70000.00', pattern: MONEY_PATTERN.source })
  @IsOptionalDefined()
  @IsMoney()
  salePriceBlock?: string;
}
