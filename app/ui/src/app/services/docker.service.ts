import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';



@Injectable({
  providedIn: 'root'
})
export class DockerService {

  constructor(
    private socketService: SocketService
  ) {
    socketService.emit({ event: 'get containers', data: []})
  }

  
}
