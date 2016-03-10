import {Component, View, Input, Output, EventEmitter, ElementRef} from 'angular2/core';

@Component({
    selector: 'content',
    host: {
        '[attr.contenteditable]': 'editMode',
        '(paste)': 'handlePaste($event)',
        '(keydown)': 'handlePaste($event)',
        '(keyup)': 'publishChange($event)',
        '(focusout)': 'publishUpdateEnd($event)',
        '(click)': 'switchToEditMode()'
    }
})
@View({
    template: `<ng-content></ng-content>`
})
export class Content {

    _editMode: boolean;

    @Input() plainTextOnly: boolean;
    @Input() editOnClick: boolean;

    @Output() change: EventEmitter<string> = new EventEmitter<string>();
    @Output() updateend: EventEmitter<string> = new EventEmitter<string>();

    constructor(private elementRef: ElementRef) { }

    get editMode(): boolean {
        return this._editMode;
    }

    @Input() set editMode(editMode: boolean) {
        this._editMode = editMode;
        if (this._editMode) {
            this.elementRef.nativeElement.focus();
        }
    }

    handlePaste(event: any) {
        if (!this.plainTextOnly) {
            if (event.keyCode === 13) {
                return true;
            }
        } else {
            if (event.keyCode === 13 || event.type === 'paste') {
                setTimeout(function() {
                    event.target.innerHTML = event.target.innerText;
                }, 0);
            }
        }
    }

    publishChange(event: any) {
        this.change.next(this.plainTextOnly ? event.target.innerText : event.target.innerHTML);
    }

    publishUpdateEnd(event: any) {
        this.updateend.next(this.plainTextOnly ? event.target.innerText : event.target.innerHTML);
    }

    switchToEditMode() {
        if (this.editOnClick) {
            this.editMode = true;
        }
    }
}
