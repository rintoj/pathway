import {Component, View, Input, Output, EventEmitter} from 'angular2/core';
import {LoaderComponent} from '../loader/loader.component';

@Component({
  selector: 'pw-popup'
})
@View({
  directives: [LoaderComponent],
  template: `
		<div class="dialog" [class.open]="show">
			<div class="overlay" (click)="hide()"></div>
			<div class="dialog-body">
					<div class="dialog-header">Create TCS dreamUP&trade; App</div>
					<div class="dialog-content">
						<ng-content></ng-content>
					</div>

					<div class="dialog-footer">
							<div class="dialog-button dialog-primary-button dialog-disabled-button"><i class="fa fa-magic"></i> Create</div>
							<div class="dialog-button dialog-cancel-button" (click)="hide()"><i class="fa fa-times"></i> Cancel</div>
					</div>
			</div>
		</div>
	`
})
export class PopupComponent {

  @Input() private show: boolean;
  @Output() private autoHide = new EventEmitter();

  constructor() {
    this.show = true;
  }

  hide() {
    this.show = false;
    this.autoHide.next(this.show);
  }
}
