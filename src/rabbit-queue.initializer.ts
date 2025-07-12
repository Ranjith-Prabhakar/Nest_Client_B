/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitQueueInitializer implements OnModuleInit {
  async onModuleInit() {
    const conn = await amqp.connect('amqp://guest:guest@localhost:5672');
    const channel = await conn.createChannel();

    // DLQ (final dead letter storage)
    await channel.assertQueue('to-clientB.dlq', {
      durable: true,
    });

    // Retry queue that sends messages back to main after TTL
    await channel.assertQueue('to-clientB.retry', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': 'to-clientB',
        'x-message-ttl': 10000, // retry after 10 sec
      },
    });

    // Main processing queue that sends failed messages to retry queue
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
