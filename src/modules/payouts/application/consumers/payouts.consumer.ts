import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../../../../../infrastructure/rabbitmq/rabbitmq.service';
import { PayoutsService } from '../payouts.service';
import getLogger from '../../../../common/helpers/getLogger';

@Injectable()
export class PayoutsConsumer implements OnModuleInit {
  constructor(
    private readonly rmq: RabbitMQService,
    private readonly payouts: PayoutsService,
  ) {}

  async onModuleInit() {

    const logger = getLogger();

    await this.rmq.waitReady();

    await this.rmq.subscribe('payouts.daily', async (msg) => {
      const { merchantId } = msg;
      logger.log(`🎧 Consuming payout task → merchant ${merchantId}`);

      const result = await this.payouts.dailyPayout(merchantId);
      logger.log(result);

      logger.log(`✅ Done payout for merchant ${merchantId}`)
    });
  }
}
