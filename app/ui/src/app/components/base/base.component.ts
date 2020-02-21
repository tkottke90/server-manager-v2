import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'sm-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseComponent implements OnInit {

  @Input() public menuEnabled: Boolean = false;
  @Input() title = 'Server Manager';

  sidenavOpened = false;

  constructor() {}

  ngOnInit(): void {
  }

}
