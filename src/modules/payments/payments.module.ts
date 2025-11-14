import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentOrmEntity } from './domain/payment.orm-entity';
import { PaymentsService } from './application/payments.service';
import { PaymentsController } from './api/payments.controller';
import { SystemConfigModule } from '../system-config/system-config.module'
import { MerchantsModule } from '../merchants/merchants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentOrmEntity]),
    SystemConfigModule,
    MerchantsModule,
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
