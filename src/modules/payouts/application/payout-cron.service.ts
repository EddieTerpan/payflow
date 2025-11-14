import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RabbitMQService } from '../../../../infrastructure/rabbitmq/rabbitmq.service';
import { PaymentsService } from '../../payments/application/payments.service';
import { MerchantsService } from '../../merchants/application/merchants.service';
import getLogger from '../../../common/helpers/getLogger';
import { PaymentStatus } from '../../payments/enums/payment-status.enum';

@Injectable()
export class PayoutCronService {
  constructor(
    private readonly rmq: RabbitMQService,
    private readonly payments: PaymentsService,
    private readonly merchants: MerchantsService,
  ) {}

  @Cron('* * * * * *') // раз на добу
  async runDaily() {
    const payableMerchantIds =
      await this.payments.getPayablePaymentsMerchantIds();
    const merchantsList = await this.merchants.getByIds(payableMerchantIds);

    for (const m of merchantsList) {
      await this.rmq.send('payouts.daily', {
        merchantId: m._id.toString(),
      });
    }
  }

  @Cron('* * * * *') // раз на хвилину
  async everyMinute() {
    const logger = getLogger();
    logger.log('everyMinute cron started');

    const payableMerchantIds = await this.payments.getPaymentsMerchantIds(
      [PaymentStatus.ACCEPTED, PaymentStatus.PAID_PENDING]
    );
    const merchantsList = await this.merchants.getByIds(payableMerchantIds);

    logger.log(merchantsList);

    for (const m of merchantsList) {
      await this.rmq.send('payouts.process-processed', {
        merchantId: m._id.toString(),
      });
      await this.rmq.send('payouts.process-accepted', {
        merchantId: m._id.toString(),
      });
    }
  }
}
