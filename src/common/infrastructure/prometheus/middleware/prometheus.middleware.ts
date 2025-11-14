import { Injectable, NestMiddleware } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class PrometheusMiddleware implements NestMiddleware {
  private readonly httpRequestCounter: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;

  constructor(private registry: Registry) {
    this.httpRequestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in ms',
      labelNames: ['method', 'route', 'status'],
      buckets: [10, 50, 100, 300, 500, 1000, 1500],
      registers: [this.registry],
    });
  }

  use(req: any, res: any, next: () => void) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const method = req.method;
      const route = req.route?.path || req.originalUrl || 'unknown';
      const status = res.statusCode.toString();

      this.httpRequestCounter.inc({ method, route, status });
      this.httpRequestDuration.observe(
        { method, route, status },
        duration,
      );
    });

    next();
  }
}
