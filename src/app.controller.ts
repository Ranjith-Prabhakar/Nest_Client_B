import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CLIENT_B_SERVICE_RABBITMQ, MESSAGE_FORMAT } from './constants';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { SocketGateway } from './socket.gateway';

@Controller()
export class AppController {
  constructor(
    @Inject(CLIENT_B_SERVICE_RABBITMQ) private readonly client: ClientProxy,
    private readonly socketGateway: SocketGateway,
  ) {}

  @Post('/message-to-a')
  sendMessageToClientA(@Body() body: MESSAGE_FORMAT) {
    this.client.emit('message-from-client-B', body);
    return { message: 'message sent to RabbitMQ', body };
  }

  @MessagePattern('message-from-client-A')
  handleMessageFromClientA(
    @Payload() body: MESSAGE_FORMAT,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      console.log('Message received from client A:', body);

      const retryCount = body.retries ?? 0;
      if (retryCount > 2) {
        console.warn('Message exceeded retry limit. Sending to DLQ:', body);

        channel.sendToQueue(
          'to-clientB.dlq',
          Buffer.from(JSON.stringify(body)),
          {
            persistent: true,
            contentType: 'application/json',
          },
        );

        channel.ack(originalMsg);
        return;
      }

      // Simulate failure randomly
      // if (Math.random() < 0.3) throw new Error('Simulated processing failure');

      this.socketGateway.sendMessageToClientBTab(body);
      channel.ack(originalMsg);
    } catch (err) {
      console.error('Error while processing message:', err);

      const retryCount = body.retries ?? 0;
      const updatedMsg = {
        ...body,
        retries: retryCount + 1,
      };

      channel.sendToQueue(
        'to-clientB.retry',
        Buffer.from(JSON.stringify(updatedMsg)),
        {
          persistent: true,
          contentType: 'application/json',
        },
      );

      channel.ack(originalMsg);
    }
  }
}
