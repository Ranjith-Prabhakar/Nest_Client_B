import { Body, Controller, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CLIENT_B_SERVICE_RABBITMQ, MESSAGE_FORMAT } from './constants';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { SocketGateway } from './socket.gateway';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CLIENT_B_SERVICE_RABBITMQ) private readonly client: ClientProxy,
    private readonly socketGateway: SocketGateway,
  ) {}

  @Post('/message-to-a')
  sendMessageToClientA(@Body() body: MESSAGE_FORMAT) {
    this.client.emit('message-from-client-B', body);
    return { message: 'message sent to rabbitMQ', body };
  }

  @MessagePattern('message-from-client-A')
  handleMessageFromClientA(@Payload() body: MESSAGE_FORMAT) {
    console.log('message received from client B ', body);
    // Send real-time message to Client B tab
    this.socketGateway.sendMessageToClientBTab(body);
  }
}
