import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';

import { ComponentsModule } from '../../components/components.module';

import { HomeComponent } from './home/home.component';

const routes: Route[] = [
  { path: '', component: HomeComponent }
]

@NgModule({
  declarations: [ HomeComponent ],
  imports: [
    CommonModule,
    ComponentsModule,
    RouterModule.forChild(routes)
  ]
})
export class HomeModule { }
