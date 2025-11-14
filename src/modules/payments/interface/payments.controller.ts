import { Body, Controller, Post, Param } from '@nestjs/common';
import { PaymentsService } from '../application/payments.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { PayoutsService } from '../../payouts/application/payouts.service';
import { PayoutResponseDto } from '../../payouts/dto/payout-response.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly payouts: PayoutsService,
  ) {}

  // ------------------------------------------------------------------------
  // 1) Створення нового платежу
  // ------------------------------------------------------------------------
  @Post()
  @ApiOperation({
    summary: 'Create a new payment',
    description: 'Registers a new incoming payment for a merchant. Status = ACCEPTED.',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    schema: {
      example: {
        id: 1,
        merchantId: 10,
        amount: 150,
        status: 'ACCEPTED',
      },
    },
  })
  create(@Body() dto: CreatePaymentDto) {
    return this.payments.create(dto.merchantId, dto.amount);
  }

  // ------------------------------------------------------------------------
  // 2) Ручний запуск ACCEPTED → PROCESSED
  //    (імітація processAccepted консьюмера)
  // ------------------------------------------------------------------------
  @Post('process-accepted/:merchantId')
  @ApiOperation({
    summary: 'Process ACCEPTED → PROCESSED',
    description: 'Blocks D and calculates available = amount - A - B - C - D.',
  })
  processAccepted(@Param('merchantId') merchantId: string) {
    return this.payouts.processAccepted(merchantId);
  }

  // ------------------------------------------------------------------------
  // 3) Ручний запуск PROCESSED → COMPLETED + PAID_PENDING → PAID
  //    (імітація processProcessed консьюмера)
  // ------------------------------------------------------------------------
  @Post('process-completed/:merchantId')
  @ApiOperation({
    summary: 'Process PROCESSED → COMPLETED and PAID_PENDING → PAID',
    description:
      'Unlocks D, moves payments to COMPLETED, and finalizes pending payouts.',
  })
  processCompleted(@Param('merchantId') merchantId: string) {
    return this.payouts.processProcessed(merchantId);
  }

  // ------------------------------------------------------------------------
  // 4) Ручний запуск добової виплати
  // ------------------------------------------------------------------------
  @Post('payout/:merchantId')
  @ApiOperation({
    summary: 'Run daily payout manually',
    description:
      'Performs daily payout: chooses payments according to available balance and marks them PAID or PAID_PENDING.',
  })
  @ApiResponse({ status: 200, type: PayoutResponseDto })
  runDailyPayout(@Param('merchantId') merchantId: string) {
    return this.payouts.dailyPayout(merchantId);
  }

  // ------------------------------------------------------------------------
  // 5) Ручний переклад статусів для тестів (кастомний endpoint)
  //    — може бути корисним у розробці для ручного управління
  // ------------------------------------------------------------------------
  @Post('set-status')
  @ApiOperation({
    summary: 'Manually set payment status',
    description: 'For debugging/testing state transitions only.',
  })
  @ApiBody({ type: UpdateStatusDto })
  setStatus(@Body() dto: UpdateStatusDto) {
    return this.payments.setStatus(dto.ids, dto.status);
  }
}
