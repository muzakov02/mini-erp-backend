import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { IsName } from '../../common/validation/decorators.js';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Main warehouse' })
  @IsName()
  name: string;

  @ApiPropertyOptional({ example: 1, description: 'Root warehouse id' })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number;
}
