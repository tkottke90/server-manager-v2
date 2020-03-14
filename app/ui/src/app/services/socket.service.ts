import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { fromEvent, BehaviorSubject } from 'rxjs';

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

  public socketStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    console.log('new socket service');
    this.socket = io({
      transports: ['websocket'],
      secure: true,
      upgrade: false
    });

    fromEvent(this.socket, 'connect')
      .subscribe( event => {
        this.socketStatus.next(true);
      });

    fromEvent(this.socket, 'disconnect')
      .subscribe( event => {
        this.socketStatus.next(false);
      });

    fromEvent(this.socket, 'reconnect')
      .subscribe( event => {
        this.socketStatus.next(true);
      });
  }

  disconnect() {
    this.socket.disconnect();
    this.socket = null;
  }

  listen(eventName: string) {
    // this.socket.on(eventName, action);
    return fromEvent<any[]>(this.socket, eventName);
  }

  emit(socketEvent: ISocketEvent) {
    this.socket.emit(socketEvent.event, ...[socketEvent.token, ...socketEvent.data]);
  }
}
