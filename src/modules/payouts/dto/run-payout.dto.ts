import { ApiProperty } from '@nestjs/swagger';

export class RunPayoutDto {
  @ApiProperty({
    description: 'Merchant ID for which to run daily payout',
    example: 12,
  })
  merchantId: string;
}
