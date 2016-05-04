import {Component, View, Input, Output, EventEmitter} from 'angular2/core';

export interface DropdownOption {
    text: string;
    value?: string;
    icon?: string;
    selected?: boolean;
}

@Component({
    selector: 'dropdown'
})
@View({
    template: `
    <div class="dd-item-list" [class.open]="showDropdown">
        <div class="dd-item" *ngFor="#item of options" (click)="selectItem(item)"> 
            <span [class]="'dd-icon ' + item.icon" *ngIf="item.icon !== undefined"></span>
            <span class="dd-text">{{item.text}}</span>
        </div>
    </div>
    <div class="dd-input fa" (click)="toggleDropdown()">
        <span [class]="'dd-icon ' + selectedItem?.icon"></span>
        <span class="dd-text">{{selectedItem?.text}}</span>            
    </div>
	`
})
export class Dropdown {

    @Input() selectedItem: DropdownOption;
    @Input() options: DropdownOption[];
    @Output() change = new EventEmitter();

    private showDropdown: boolean;

    constructor() {
        this.showDropdown = false;
        this.selectedItem = {
            text: '--select--'
        };
    }

    toggleDropdown(): void {
        this.showDropdown = !this.showDropdown;
    }

    selectItem(item: DropdownOption): void {
        let changed: boolean = this.selectedItem !== item;

        this.selectedItem = item;
        this.hide();
        if (changed) {
            this.change.next(this.selectedItem);
        }
    }

    hide(): void {
        this.showDropdown = false;
    }
}
