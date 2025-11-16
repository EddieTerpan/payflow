import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../enums/payment-status.enum';
import { IsObjectId } from '../../../common/validators/is-object.validator';

export class UpdatePaymentDto {
  @IsObjectId()
  @ApiPropertyOptional({ example: '691779e3449b4aeaffcea5f7' })
  merchantId?: string;

  @ApiPropertyOptional({ example: 1000 })
  amount?: number;

  @ApiPropertyOptional({ example: 20 })
  feeA?: number;

  @ApiPropertyOptional({ example: 0.3 })
  feeB?: number;

  @ApiPropertyOptional({ example: 0.5 })
  feeC?: number;

  @ApiPropertyOptional({ example: 30 })
  holdD?: number;

  @ApiPropertyOptional({ example: 950 })
  available?: number;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    example: PaymentStatus.PROCESSED,
  })
  status?: PaymentStatus;
}
