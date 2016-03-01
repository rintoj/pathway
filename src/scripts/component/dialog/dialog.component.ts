import {Component, View, Input, Output, EventEmitter} from 'angular2/core';

@Component({
  selector: 'pw-dialog'
})
@View({
  template: `
		<div class="dialog" [class.open]="show" [class.no-title]="!showTitle">
			<div class="overlay" (click)="hide()"></div>
			<div class="dialog-body">
					<div class="dialog-header">{{title}}</div>
					<div class="dialog-content">
						<ng-content></ng-content>
					</div>
			</div>
		</div>
	`
})
export class DialogComponent {

  @Input() show: boolean;
  @Input() title: string = null;
  @Input() showTitle: boolean = false;
  @Output() autoHide = new EventEmitter();

  constructor() {
    this.show = true;
  }

  hide() {
    this.show = false;
    this.autoHide.next(this.show);
  }
}
