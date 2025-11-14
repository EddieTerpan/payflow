import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../enums/payment-status.enum';

export class UpdateStatusDto {
  @ApiProperty({
    type: [String],
    description: 'List of payment IDs to update',
  })
  ids: string[];

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
    description: 'New status for selected payments',
  })
  status: PaymentStatus;
}
