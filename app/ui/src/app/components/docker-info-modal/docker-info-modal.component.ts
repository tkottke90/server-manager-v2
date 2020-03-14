import { Component, OnInit, ChangeDetectionStrategy, Inject, ChangeDetectorRef } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import { DockerService } from '@services/docker.service';

@Component({
  selector: 'sm-docker-info-modal',
  templateUrl: './docker-info-modal.component.html',
  styleUrls: ['./docker-info-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DockerInfoModalComponent implements OnInit {

  containerDetails;

  constructor(
    private dockerService: DockerService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.dockerService.getContainerByName.subscribe( data => {
      const [ eventData, eventStatus ] = data;

      console.dir(data);

      if (eventStatus.status !== 200) {
        console.error(`Error: ${eventData}`);
        return;
      }

      this.containerDetails = data[0];
      this.cdr.markForCheck();
    });


    const containerName = this.data.Names[0].replace('/', '');
    this.dockerService.getContainer(containerName);
  }

  getContainerDisplayName(names: string[]) {
    const name = names[0];
    return this.capitalize(name.replace('/', ''));
  }

  getContainerDisplaySha(shaStr: string) {
    return shaStr.slice(1, 12);
  }

  getLocalDate(date: number) {
    return new Date(date *   1000).toLocaleString();
  }

  capitalize(value: string) {
    return value.replace(/^\w/, c => c. toUpperCase());
  }
}
