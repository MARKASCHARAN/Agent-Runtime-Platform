import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('WebSocket Gateway Initialized');
  }

  emitAlert(payload: any) {
    this.server.emit('runtime.alert', payload);
  }

  emitPolicyIntervention(payload: any) {
    this.server.emit('policy.intervention', payload);
  }

  emitApprovalRequired(payload: any) {
    this.server.emit('approval.required', payload);
  }

  emitMemoryAnomaly(payload: any) {
    this.server.emit('memory.anomaly', payload);
  }

  emitReplayReady(payload: any) {
    this.server.emit('replay.ready', payload);
  }
}
