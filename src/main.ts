import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import getLogger from './common/helpers/getLogger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ensuria Payflow API')
    .setDescription('Payment Aggregator API — DDD architecture with Redis, Mongo, MySQL, RabbitMQ')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
    },
  });

  const port = process.env.PORT || 8080;
  await app.listen(port);

  const logger = getLogger();
  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`📘 Swagger docs available at http://localhost:${port}/api/docs`);
}

void bootstrap();
