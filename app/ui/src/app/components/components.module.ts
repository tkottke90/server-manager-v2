import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

import { MatButtonModule } from '@angular/material/button';
import { MatIconRegistry, MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { BaseComponent } from './base/base.component';
import { DockerInfoModalComponent } from './docker-info-modal/docker-info-modal.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [BaseComponent, DockerInfoModalComponent],
  imports: [
    CommonModule,
    // Angular Material
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule
  ],
  exports: [ BaseComponent, DockerInfoModalComponent ]
})
export class ComponentsModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer){
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));
  }
}
