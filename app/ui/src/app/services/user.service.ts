import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

import { User } from '../classes/user.class';
import { BehaviorSubject } from 'rxjs';

const baseRoute = 'users'

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public redirectUrl: string = '';
  private currentUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  constructor(
    private http: HttpService
  ) { }

  public getCurrentUser() {
    return this.currentUser.getValue();
  }

  async login(username: string, password: string) {
    let result;
    try {
      result = await this.http.post(`authenticate`, { email: username, password });
    } catch (err) {
      return false
    }

    console.dir(result);

    window.sessionStorage.setItem('token', result.token);
    return true
  }

  logout() {
    this.currentUser.next(null);
    window.sessionStorage.removeItem('token')
  }
}
