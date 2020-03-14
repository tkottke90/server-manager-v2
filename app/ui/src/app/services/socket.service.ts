import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { fromEvent } from 'rxjs';

export interface ISocketEvent {
  event: string;
  token?: string;
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io({
      transports: ['websocket'],
      secure: true,
      upgrade: false
    });
  }

  
  listen(eventName: string) {
    // this.socket.on(eventName, action);
    return fromEvent<any[]>(this.socket, eventName);
  }

  emit(socketEvent: ISocketEvent) {
    this.socket.emit(socketEvent.event, ...[socketEvent.token, ...socketEvent.data]);
  }
}
