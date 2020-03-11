import { Component, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { UserService } from '@services/user.service';

import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Router } from '@angular/router';

const ENTER_KEY = 13;

@Component({
  selector: 'sm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {

  loading = false;

  email = new FormControl('');
  password = new FormControl('');

  @HostListener('window:keydown', ['$event'])
  keyEvent($event: KeyboardEvent) {
    // console.log($event.keyCode);

    if ($event.keyCode === ENTER_KEY) {
      this.submitTrigger();
    }
  }

  constructor(
    private router: Router,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  openSnackBar(message: string) {
    this._snackBar.open(message, null, {
      duration: 2000,
    });
  }

  async submitTrigger() {
    this.loading = true;
    this.cdr.markForCheck();

    const result = await this.userService.login(this.email.value, this.password.value);

    console.log(`Result: `, result);

    this.loading = false;
    this.cdr.markForCheck(); 
    if (!result) {
      this.openSnackBar('Error Logging In');
      return;
    }

    this.router.navigateByUrl('/');
  }

}
