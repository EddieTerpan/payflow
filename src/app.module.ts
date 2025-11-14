import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MysqlModule } from './common/database/mysql/mysql.module';
import { MongoModule } from './common/database/mongo/mongo.module';
import { RedisModule } from './common/database/redis/redis.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrometheusModule } from './common/infrastructure/prometheus/prometheus.module';
import { PrometheusMiddleware } from './common/infrastructure/prometheus/middleware/prometheus.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrometheusModule,
    MysqlModule,
    MongoModule,
    RedisModule,
    PaymentsModule,
    PayoutsModule,
    MerchantsModule,
    SystemConfigModule
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PrometheusMiddleware)
      .forRoutes('*');
  }
}
