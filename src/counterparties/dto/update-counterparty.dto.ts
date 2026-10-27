import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  IsName,
  IsOptionalDefined,
  Trim,
} from '../../common/validation/decorators.js';
import { CounterpartyType } from '../../generated/prisma/client.js';

export class UpdateCounterpartyDto {
  @ApiPropertyOptional({ example: 'Alisher aka' })
  @IsOptionalDefined()
  @IsName()
  name?: string;

  @ApiPropertyOptional({
    example: '+998901234567',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @Trim()
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional({ enum: CounterpartyType })
  @IsOptionalDefined()
  @IsEnum(CounterpartyType)
  type?: CounterpartyType;
}
