import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { RabbitMQService } from './rabbitmq.service';
@Module({
  imports: [DiscoveryModule],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMqModule {}
