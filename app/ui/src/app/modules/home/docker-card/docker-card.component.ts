import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DockerInfoModalComponent } from 'src/app/components/docker-info-modal/docker-info-modal.component';

interface IDockerContainerPorts {
  IP?: string;
  PrivatePort?: number;
  PublicPort?: number;
  Type?: string;
}

interface IDockerContainerMounts {
  Type: string;
  Source: string;
  Destination: string;
  Mode: string;
  RW: boolean;
  Propagation: string;
}

export interface IDockerContainer {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Ports?: IDockerContainerPorts[];
  Labels?: {
    [key: string]: string;
  };
  State: string;
  Status?: string;
  HostConfig?: {
    [key: string]: string;
  };
  NetworkSettings?: {
    [key: string]: any;
  };
  Mounts?: IDockerContainerMounts[];
  Config?: any;
}

@Component({
  selector: 'sm-docker-card',
  templateUrl: './docker-card.component.html',
  styleUrls: ['./docker-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DockerCardComponent {

  @Input() container: any;

  constructor(
    private dialog: MatDialog
  ) {}

  openDetailsDialog($event) {
    this.dialog.open(DockerInfoModalComponent, {
      data: this.container,
      width: '60vw'
    });
  }
}
