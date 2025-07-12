/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
    const originalMessage = context.getMessage();

    try {
      console.log('Message received from client A:', body);
      this.socketGateway.sendMessageToClientBTab(body);
      channel.ack(originalMessage);
    } catch (err) {
      console.error('Error while processing message:', err);
      channel.nack(originalMessage, false, false);
    }
  }
}
