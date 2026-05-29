import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/realtime',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket): void {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query?.token as string);

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      const tenantId = payload.tenantId?.toString?.() || payload.tenantId;
      if (!tenantId) {
        client.disconnect();
        return;
      }

      client.join(`tenant:${tenantId}`);
      (client as any).tenantId = tenantId;
      this.logger.log(`Client realtime connecté (tenant ${tenantId})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Client realtime déconnecté`);
  }

  emitToTenant(tenantId: string, event: string, data: unknown): void {
    if (!this.server) return;
    this.server.to(`tenant:${tenantId}`).emit(event, data);
    this.server.to(`tenant:${tenantId}`).emit('notification', data);
  }
}
