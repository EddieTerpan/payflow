import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { IsObjectId } from '../../../common/validators/is-object.validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsObjectId()
  merchantId: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(1)
  amount: number;
}
