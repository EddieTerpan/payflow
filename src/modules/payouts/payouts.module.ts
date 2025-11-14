import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { MerchantsModule } from '../merchants/merchants.module'
import { RabbitMqModule } from '../../../infrastructure/rabbitmq/rabbitmq.module';

import { PayoutsService } from './application/payouts.service';
import { PayoutsConsumer } from './infrastructure/payouts.consumer';
import { PayoutCronService } from './application/payout-cron.service';
import { PayoutsController } from './api/payouts.controller';
import { SystemConfigModule } from '../system-config/system-config.module';
import { ProcessAcceptedConsumer } from './infrastructure/process-accepted.consumer';
import { ProcessProcessedConsumer } from './infrastructure/process-processed.consumer';

@Module({
  imports: [
    PaymentsModule,
    MerchantsModule,
    RabbitMqModule,
    SystemConfigModule
  ],
  providers: [
    PayoutsService,
    PayoutsConsumer,
    ProcessAcceptedConsumer,
    ProcessProcessedConsumer,
    PayoutCronService,
  ],
  controllers: [PayoutsController],
  exports: [PayoutsService],
})
export class PayoutsModule {}
