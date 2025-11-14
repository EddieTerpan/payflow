import { Controller, Post, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiParam,
} from '@nestjs/swagger';

import { PayoutsService } from '../application/payouts.service';
import { PayoutResponseDto } from '../dto/payout-response.dto';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto';

@ApiTags('payouts')
@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payouts: PayoutsService) {}

  // ============================================================================
  // 1) ACCEPTED → PROCESSED
  // ============================================================================
  @Post('process-accepted/:merchantId')
  @ApiOperation({
    summary: 'Process all ACCEPTED payments → PROCESSED',
  })
  @ApiParam({ name: 'merchantId', example: '691779e3449b4aeaffcea5f7' })
  @ApiOkResponse({ description: 'ACCEPTED payments processed', schema: { example: { ok: true } } })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async processAccepted(@Param('merchantId') merchantId: string) {
    await this.payouts.processAccepted(merchantId);
    return { ok: true };
  }

  // ============================================================================
  // 2) PROCESSED → COMPLETED  +  PAID_PENDING → PAID
  // ============================================================================
  @Post('process-processed/:merchantId')
  @ApiOperation({
    summary: 'Process PROCESSED → COMPLETED and PAID_PENDING → PAID',
  })
  @ApiParam({ name: 'merchantId', example: '691779e3449b4aeaffcea5f7' })
  @ApiOkResponse({ description: 'PROCESSED payments completed', schema: { example: { ok: true } } })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async processProcessed(@Param('merchantId') merchantId: string) {
    await this.payouts.processProcessed(merchantId);
    return { ok: true };
  }

  // ============================================================================
  // 3) Daily payout
  // ============================================================================
  @Post('daily/:merchantId')
  @ApiOperation({
    summary: 'Run daily payout',
    description:
      'Executes the daily payout flow (COMPLETED → PAID, PROCESSED → PAID_PENDING) and returns payout report.',
  })
  @ApiParam({
    name: 'merchantId',
    example: '691779e3449b4aeaffcea5f7',
    description: 'Merchant ID for payout execution',
  })
  @ApiOkResponse({
    description: 'Daily payout processed successfully',
    type: PayoutResponseDto,
  })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
  async runDaily(@Param('merchantId') merchantId: string): Promise<PayoutResponseDto> {
    return this.payouts.dailyPayout(merchantId);
  }
}
