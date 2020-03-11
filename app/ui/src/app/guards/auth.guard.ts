import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '@services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private UserService: UserService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    console.log('AuthGard#canActivate called');

    const token = window.sessionStorage.getItem('token');
    
    if (token) return true;

    this.UserService.redirectUrl = state.url;

    this.UserService.logout();
    this.router.navigate(['/login']);
    return false;
  }
  
}
