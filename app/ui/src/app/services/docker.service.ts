import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { Observable, fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DockerService {

  getContainerEvent: Observable<any[]>;

  constructor(
    private socketService: SocketService
  ) {
    this.init();
  }

  init() {
    this.getContainerEvent = this.socketService.listen('get containers');
  }

  getContainers() {
    this.socketService.emit({ event: 'get containers', data: []});
  }
  
  getContainer(name: String) {
    this.socketService.emit({ event: 'get container', data: [{ name }]})
  }
}
