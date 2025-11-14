import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Merchant,
  MerchantSchema,
} from './infrastructure/merchant.schema';
import { MerchantsService } from './application/merchants.service';
import { MerchantsController } from './api/merchants.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Merchant.name, schema: MerchantSchema },
    ]),
  ],
  controllers: [MerchantsController],
  providers: [MerchantsService],
  exports: [MerchantsService],
})
export class MerchantsModule {}
