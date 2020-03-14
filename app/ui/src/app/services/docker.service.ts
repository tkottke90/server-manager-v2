import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { Observable, fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DockerService {

  getContainerEvent: Observable<any[]>;
  getContainerByName: Observable<any[]>;

  constructor(
    private socketService: SocketService
  ) {
    this.init();
  }

  init() {
    this.getContainerEvent = this.socketService.listen('get containers');
    this.getContainerByName = this.socketService.listen('get container');
  }

  getContainers({ all } = { all: false}) {
    this.socketService.emit({ event: 'get containers', data: { params: { all } } });
  }

  getContainer(name: string) {
    this.socketService.emit({ event: 'get container', data: { params: { name } } });
  }
}
