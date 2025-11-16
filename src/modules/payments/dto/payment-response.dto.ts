import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../enums/payment-status.enum';
import { IsObjectId } from '../../../common/validators/is-object.validator';

export class PaymentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  @IsObjectId()
  merchantId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty()
  feeA: number;

  @ApiProperty()
  feeB: number;

  @ApiProperty()
  feeC: number;

  @ApiProperty()
  holdD: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
