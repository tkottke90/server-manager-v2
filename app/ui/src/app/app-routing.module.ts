import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';


const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('@modules/login/login.module').then( m => m.LoginModule )
  },
  {
    path: '',
    loadChildren: () => import('@modules/home/home.module').then( m => m.HomeModule )
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
