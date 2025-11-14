import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '../../common/database/redis/redis.module';
import { SystemConfigService } from './aplication/system-config.service';
import { SystemConfig, SystemConfigSchema } from './infrastructure/system-config.schema';
import { SystemConfigController } from './api/system-config.controller';

@Module({
  imports: [
    RedisModule,
    MongooseModule.forFeature([
      { name: SystemConfig.name, schema: SystemConfigSchema },
    ]),
  ],
  controllers: [SystemConfigController],
  providers: [SystemConfigService],
  exports: [SystemConfigService],
})
export class SystemConfigModule {}
