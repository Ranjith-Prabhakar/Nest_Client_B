import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RABBITMQ_URI } from './constants';

@Injectable()
export class RabbitQueueInitializer implements OnModuleInit {
  async onModuleInit() {
    const conn = await amqp.connect(RABBITMQ_URI);
    const channel = await conn.createChannel();

    await channel.assertQueue('to-clientB.dlq', {
      durable: true,
    });

    await channel.assertQueue('to-clientB.retry', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': 'to-clientB',
        'x-message-ttl': 10000,
      },
    });

    await channel.assertQueue('to-clientB', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': 'to-clientB.retry',
      },
    });

    await channel.close();
    await conn.close();
  }
}
