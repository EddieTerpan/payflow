import { Module, Global } from '@nestjs/common';
import { Registry, collectDefaultMetrics } from 'prom-client';
import { PrometheusController } from './prometheus.controller';

@Global()
@Module({
  controllers: [PrometheusController],
  providers: [
    {
      provide: Registry,
      useFactory: () => {
        const registry = new Registry();
        collectDefaultMetrics({ register: registry });
        return registry;
      },
    },
  ],
  exports: [Registry],
})
export class PrometheusModule {}
