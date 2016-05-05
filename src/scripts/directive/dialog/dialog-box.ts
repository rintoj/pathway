import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'dialog-box',
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
export class DialogBox {

  @Input() show: boolean;
  @Input() title: string = null;
  @Input() showTitle: boolean = false;
  @Output() autoHide = new EventEmitter();

  constructor() {
    this.show = true;
  }

  hide(): void {
    this.show = false;
    this.autoHide.next(this.show);
  }
}
