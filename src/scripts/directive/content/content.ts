import {Component, View, Input, Output, EventEmitter} from 'angular2/core';

@Component({
  selector: 'content'
})
@View({
  template: `<span [attr.contenteditable]="editMode"
									(paste)="handlePaste($event)"
									(keydown)="handlePaste($event)"
									(keyup)="publishChange($event)"
									(focusout)="publishUpdateEnd($event)"
									(dblclick)="switchToEditModeOnDblClick()">
									<ng-content></ng-content>
						</span>`
})
export class Content {

  @Input() editMode: boolean;
  @Input() plainTextOnly: boolean;
	@Input() editOnDblClick: boolean;

  @Output() change: EventEmitter<string> = new EventEmitter<string>();
  @Output() updateend: EventEmitter<string> = new EventEmitter<string>();

  handlePaste(event: any) {
    if (event.keyCode === 13 && !this.plainTextOnly) {
      return true;
    } else if (event.keyCode === 13 || event.type === 'paste') {
      setTimeout(function() {
        event.target.innerHTML = event.target.innerText;
      }, 0);
    }
  }

  publishChange(event: any) {
    this.change.next(event.target.innerText);
  }

  publishUpdateEnd(event: any) {
    this.updateend.next(event.target.innerText);
  }

	switchToEditModeOnDblClick() {
		if(this.editOnDblClick) {
			this.editMode = true;
		}
	}
}
