import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import getLogger from '../../src/common/helpers/getLogger';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  private readyPromise: Promise<void>;
  private resolveReady!: () => void;

  constructor() {
    // Створюємо проміс, який зарезолвиться після ініціалізації RabbitMQ
    this.readyPromise = new Promise(res => {
      this.resolveReady = res;
    });
  }

async onModuleInit() {
  const url =
    `amqp://${process.env.RABBITMQ_USER || 'admin'}:` +
    `${process.env.RABBITMQ_PASS || 'admin'}@` +
    `${process.env.RABBITMQ_HOST || 'rabbitmq'}:` +
    `${process.env.RABBITMQ_PORT || 5672}`;

  const logger = getLogger();

  logger.log('🐰 Connecting to RabbitMQ:', url);

  while (true) {
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      logger.log('🐰 RabbitMQ channel successfully created');
      this.resolveReady();
      break;
    } catch (e) {
      logger.error('❌ RabbitMQ not ready:', e.message);
      logger.log('⏳ Retry in 3 seconds...');
      await new Promise((res) => setTimeout(res, 3000)); // retry
    }
  }
}

  /** Чекаємо, поки канал створиться */
  async waitReady(): Promise<void> {
    return this.readyPromise;
  }

  /** Надіслати повідомлення в чергу */
  async send(queue: string, message: unknown) {
    await this.waitReady();

    if (!this.channel) throw new Error('RabbitMQ channel is not initialized');

    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  }

  /** Підписатися на чергу */
  async subscribe(queue: string, handler: (msg: any) => Promise<any>) {
    await this.waitReady();

    if (!this.channel) throw new Error('RabbitMQ channel is not initialized');

    await this.channel.assertQueue(queue, { durable: true });

    this.channel.consume(queue, async (msg) => {
      if (!msg) return;

      const data = JSON.parse(msg.content.toString());

      try {
        await handler(data);
        this.channel.ack(msg);
      } catch (err) {
        console.error('RabbitMQ consumer error:', err);
        this.channel.nack(msg, false, true); // повтор
      }
    });
  }
}
