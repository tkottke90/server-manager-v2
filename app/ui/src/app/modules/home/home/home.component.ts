import { Component, OnInit } from '@angular/core';

import { DockerService } from '@services/docker.service';

@Component({
  selector: 'sm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private dockerService: DockerService
  ) { }

  ngOnInit(): void {
    this.dockerService.getContainerEvent.subscribe( data => {
      console.dir(data);
    });

    // this.dockerService.getContainers(); 
  }

}
