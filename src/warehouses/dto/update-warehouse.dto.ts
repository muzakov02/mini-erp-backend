import { ApiProperty } from '@nestjs/swagger';
import { IsName } from '../../common/validation/decorators.js';

export class UpdateWarehouseDto {
  @ApiProperty({ example: 'Main warehouse' })
  @IsName()
  name: string;
}
