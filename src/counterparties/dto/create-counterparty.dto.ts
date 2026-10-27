import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Trim, IsName } from '../../common/validation/decorators.js';
import { CounterpartyType } from '../../generated/prisma/client.js';

export class CreateCounterpartyDto {
  @ApiProperty({ example: 'Alisher aka' })
  @IsName()
  name: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @Trim()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: CounterpartyType, example: CounterpartyType.CUSTOMER })
  @IsEnum(CounterpartyType)
  type: CounterpartyType;
}
