import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { Match } from './entities/match.entity';
import { WsJwtAuthGuard } from 'src/auth/guards/ws-jwt-auth.guard';
import type { USocket } from 'src/types/socket';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MatchesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MatchesGateway.name);

  @UseGuards(WsJwtAuthGuard)
  handleConnection(client: USocket) {
    this.logger.debug('Handshake auth:', client.handshake.auth);
  }

  handleDisconnect(client: USocket) {
    if (client.user.id) {
      this.logger.log(`Client disconnected: ${client.user.id}`);
    }
  }

  @SubscribeMessage('unsubscribeFromUpdates')
  handleUnsubscribe(client: USocket) {
    client.leave('updates');
    if (client.user.id) {
      this.logger.log(`Client ${client.user.id} unsubscribed from updates.`);
    }
  }

  @SubscribeMessage('subscribeToUpdates')
  @UseGuards(WsJwtAuthGuard)
  handleSubscribe(client: USocket) {
    const user = client.user;

    client.join('updates');
    this.logger.log(`Client ${client.id} (User ${user.id}) subscribed to match updates.`);
  }

  sendMatchUpdate(match: Match) {
    this.server.to('updates').emit('matchUpdate', match);
    this.logger.debug(`Sent update for match ID ${match.id} to 'updates' room.`);
  }
}
