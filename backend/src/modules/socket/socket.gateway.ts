import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinTenant')
  handleJoinTenant(
    @MessageBody() data: { tenantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`tenant:${data.tenantId}`);
    return { event: 'joinedTenant', data: { tenantId: data.tenantId } };
  }

  // Emit order events
  emitOrderCreated(order: any) {
    this.server.to(`tenant:${order.tenantId}`).emit('orderCreated', order);
  }

  emitOrderUpdated(order: any) {
    this.server.to(`tenant:${order.tenantId}`).emit('orderUpdated', order);
  }

  emitOrderCompleted(order: any) {
    this.server.to(`tenant:${order.tenantId}`).emit('orderCompleted', order);
  }
}
