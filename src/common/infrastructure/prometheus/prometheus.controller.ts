import { Controller, Get, Res } from '@nestjs/common';
import { Registry } from 'prom-client';
import type { Response } from 'express';

@Controller('metrics')
export class PrometheusController {
  constructor(private registry: Registry) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', this.registry.contentType);
    res.end(await this.registry.metrics());
  }
}