import {
  Body,
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { PaymentsService } from '../application/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  // ---------------------------------------------------------
  // CREATE one payment
  // ---------------------------------------------------------
  @Post()
  @ApiOperation({ summary: 'Create a payment' })
  @ApiCreatedResponse({ type: PaymentResponseDto })
  create(@Body() dto: CreatePaymentDto) {
    return this.payments.create(dto.merchantId, dto.amount);
  }

  // ---------------------------------------------------------
  // GET one payment
  // ---------------------------------------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get single payment by ID' })
  @ApiOkResponse({ type: PaymentResponseDto })
  getOne(@Param('id') id: string) {
    return this.payments.getById(id);
  }

  // ---------------------------------------------------------
  // UPDATE one payment (any fields)
  // ---------------------------------------------------------
  @Patch(':id')
  @ApiOperation({
    summary: 'Update payment',
    description: 'Allows updating any fields of a single payment.',
  })
  @ApiOkResponse({ type: PaymentResponseDto })
  updateOne(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.payments.update(id, dto);
  }

  // ---------------------------------------------------------
  // DELETE one payment
  // ---------------------------------------------------------
  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment' })
  @ApiOkResponse({
    description: 'Deleted payment returned',
    type: PaymentResponseDto,
  })
  deleteOne(@Param('id') id: string) {
    return this.payments.delete(id);
  }
}
