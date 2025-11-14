import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../../../../infrastructure/rabbitmq/rabbitmq.service';
import { PayoutsService } from '../application/payouts.service';
import getLogger from '../../../common/helpers/getLogger';

@Injectable()
export class ProcessAcceptedConsumer implements OnModuleInit {
  constructor(
    private readonly rmq: RabbitMQService,
    private readonly payouts: PayoutsService,
  ) {}

  async onModuleInit() {

    const logger = getLogger();

    await this.rmq.waitReady();

    await this.rmq.subscribe('payouts.process-accepted', async (msg) => {
      const { merchantId } = msg;
      logger.log(`🎧 Consuming processAccepted task → merchant ${merchantId}`);

      const result = this.payouts.processAccepted(merchantId);
      logger.log(result);


      logger.log(`✅ Done processAccepted for merchant ${merchantId}`)
    });
  }
}
