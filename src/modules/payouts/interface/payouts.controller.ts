import { Body, Controller, Post } from '@nestjs/common';
import { PayoutsService } from '../application/payouts.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { RunPayoutDto } from '../dto/run-payout.dto';

@ApiTags('payouts')
@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payouts: PayoutsService) {}

  @Post('run')
  @ApiOperation({
    summary: 'Run daily payout',
    description:
      'Selects eligible payments (PROCESSED + COMPLETED) and pays them out based on merchant balance.',
  })
  @ApiBody({ type: RunPayoutDto })
  @ApiResponse({
    status: 200,
    description: 'Daily payout executed',
    schema: {
      example: {
        merchantId: 10,
        totalPaid: 1150,
        payments: [
          { id: 1, paidAmount: 1000 },
          { id: 2, paidAmount: 50 },
          { id: 3, paidAmount: 100 },
        ],
      },
    },
  })
  run(@Body() dto: RunPayoutDto) {
    return this.payouts.dailyPayout(dto.merchantId);
  }
}
