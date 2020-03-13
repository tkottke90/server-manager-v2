import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

export interface ISocketEvent {
  event: string;
  token?: string;
  data: any[] | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io({
      transports: ['websocket'],
      secure: true,
      upgrade: false
    });
  }

  
  listen(eventName: string, action: (...args) => any) {
    this.socket.on(eventName, action);
  }

  emit(socketEvent: ISocketEvent) {
    this.socket.emit(socketEvent.event, socketEvent.token, ...socketEvent.data);
  }
}
