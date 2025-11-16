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

  @Cron('0 0 * * *') // раз на добу
  async runDaily() {
    const payableMerchantIds =
      await this.payments.getPayablePaymentsMerchantIds();
    const merchantsList = await this.merchants.getByIds(payableMerchantIds);
    console.log(`daily payout merchants ids: `);

    for (const m of merchantsList) {
      await this.rmq.send('payouts.daily', {
        merchantId: m._id.toString(),
      });
    }
  }

  @Cron('*/30 * * * * *')
  async stageOne() {
    const logger = getLogger();

    logger.log('stageOne cron started');

    const firstStageIds = await this.payments.getPaymentsMerchantIds(
      [PaymentStatus.ACCEPTED, PaymentStatus.PAID_PENDING]
    );

    const firstStageMerchantIds = await this.merchants.getByIds(firstStageIds);

    logger.log(`firstStageMerchantIds: ${firstStageMerchantIds}`);

    for (const m of firstStageMerchantIds) {
      await this.rmq.send('payouts.process-accepted', {
        merchantId: m._id.toString(),
      });
    }
  }

  @Cron('*/40 * * * * *')
  async stageTwo() {
    const logger = getLogger();

    logger.log('stageTwo cron started');

    const secondStageIds = await this.payments.getPaymentsMerchantIds(
      [PaymentStatus.PROCESSED]
    );

    const secondStageMerchantIds = await this.merchants.getByIds(secondStageIds);

    logger.log(`secondStageMerchantIds: ${JSON.stringify(secondStageMerchantIds)}`);

    for (const m of secondStageMerchantIds) {
      await this.rmq.send('payouts.process-processed', {
        merchantId: m._id.toString(),
      });
    }
  }
}
