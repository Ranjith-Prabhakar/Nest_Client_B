import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CLIENT_B_SERVICE_RABBITMQ } from './constants';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CLIENT_B_SERVICE_RABBITMQ,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'to-clientA',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, SocketGateway],
})
export class AppModule {}
