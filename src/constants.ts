export const CLIENT_B_SERVICE_RABBITMQ = 'rabbitMQ_client_B_service';
export class MESSAGE_FORMAT {
  sender: string;
  message: string;
  retries?: number;
}

export const RABBITMQ_URI = 'amqp://guest:guest@localhost:5672';
export const CLIENT_URL = 'http://localhost:5173';
