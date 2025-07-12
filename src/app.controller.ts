import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CLIENT_B_SERVICE_RABBITMQ, MESSAGE_FORMAT } from './constants';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CLIENT_B_SERVICE_RABBITMQ) private readonly client: ClientProxy,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/message-to-a')
  sendMessageToClientA(@Body() body: MESSAGE_FORMAT) {
    this.client.emit('message-from-client-B', body);
    return { message: 'message sent to rabbitMQ', body };
  }

  @MessagePattern('message-from-client-A')
  handleMessageFromClientA(@Payload() body: MESSAGE_FORMAT) {
    console.log('message received from client B ', body);
  }
}
