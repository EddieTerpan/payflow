import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../../../../../infrastructure/rabbitmq/rabbitmq.service';
import { PayoutsService } from '../payouts.service';
import getLogger from '../../../../common/helpers/getLogger';

@Injectable()
export class ProcessProcessedConsumer implements OnModuleInit {
  constructor(
    private readonly rmq: RabbitMQService,
    private readonly payouts: PayoutsService,
  ) {}

  async onModuleInit() {

    const logger = getLogger();

    await this.rmq.waitReady();

    await this.rmq.subscribe('payouts.process-processed', async (msg) => {
      const { merchantId } = msg;
      logger.log(`🎧 Consuming processProcessed task → merchant ${merchantId}`);

      const result =  await this.payouts.processProcessed(merchantId);
      logger.log(result);

      logger.log(`✅ Done processProcessed for merchant ${merchantId}`)
    });
  }
}
