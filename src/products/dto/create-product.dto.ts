import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import {
  IsMoney,
  IsName,
  MONEY_PATTERN,
} from '../../common/validation/decorators.js';

export class CreateProductDto {
  @ApiProperty({ example: 'Coca-Cola 1.5L' })
  @IsName()
  name: string;

  @ApiProperty({ example: 6, minimum: 1 })
  @IsInt()
  @Min(1)
  unitsPerBlock: number;

  @ApiProperty({ example: '12000.00', pattern: MONEY_PATTERN.source })
  @IsMoney()
  salePriceUnit: string;

  @ApiProperty({ example: '70000.00', pattern: MONEY_PATTERN.source })
  @IsMoney()
  salePriceBlock: string;
}
