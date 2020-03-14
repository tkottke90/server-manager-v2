import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { DockerService } from '@services/docker.service';
import { SocketService } from '@services/socket.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'sm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  socketStatus = 'red';

  containers = [];

  constructor(
    private router: Router,
    private socketService: SocketService,
    private dockerService: DockerService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.dockerService.getContainerEvent.subscribe( data => {
      this.containers = data[0];
      console.log(data[0]);
    });

    this.socketService.socketStatus.subscribe( status => {
      this.socketStatus = status ? 'green' : 'red';
    });

    this.dockerService.getContainers({ all: true });
  }

  logout() {
    this.userService.logout();
    this.router.navigateByUrl('/login');
  }

}
