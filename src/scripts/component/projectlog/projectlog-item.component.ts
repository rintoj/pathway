import {Content} from '../../directive/content/content';
import {Dropdown, DropdownOption} from '../../directive/dropdown/dropdown';
import {Projectlog} from '../../state/projectlog';
import {ProjectlogService} from '../../service/projectlog.service';
import {Component, View, Input, Output, EventEmitter} from 'angular2/core';


interface BeforeChange {
    title: string;
    description: string;
}

@Component({
    selector: 'pw-projectlog-item'
})
@View({
    directives: [Content, Dropdown],
    template: `
		<div class="list-item" (click)="toggleOpen($event)" [class.open]="item.uiState.open"
			[class.selected-item]="item.uiState.selected" [class.edit-mode]="item.uiState.editMode">
			<!-- the list item-->
			<div class="avatar fa" (click)="toggleSelection($event)">{{item.title?.substr(0, 1).toUpperCase()}}</div>

			<div class="content">
				<div class="heading-row">
					<content class="heading"
									[editMode]="item.uiState.editMode"
									[plainTextOnly]="true"
									(updateend)="item.title = $event; changed = true;"
									(dblclick)="switchToEditMode($event)">{{item.title}}</content>
				</div>

				<div class="text">
					<div class="status">{{item.index}}</div>
                    
					<dropdown class="status"
					 [class.grey-text]="item.status==='hold'"
					 [class.blue-grey-text]="item.status==='done'"
					 [class.green-text]="item.status==='doing'"
					 [class.yellow-text]="item.status==='new'"
                     [selectedItem]="{'text': item.status}"
                     [options]="statusOptions"
                     (click)="preventEvent($event)" 
                     (change)="item.status=$event.text"></dropdown>
                     
				 	<div class="id">{{item.id}}</div>
                   
				</div>

				<content class="description"
								[editMode]="item.uiState.editMode"
								(updateend)="item.description = $event; changed = true"
								(dblclick)="switchToEditMode($event)">{{item.description}}</content>
			</div>
			<div class="action-bar">
				<a class="btn btn-round btn-primary fa fa-edit" (click)="toggleEdit($event)"></a>
				<a class="btn btn-round fa fa-save" (click)="save()"></a>
				<a class="btn btn-round fa fa-trash"></a>
			</div>
		</div>
	`
})
export class ProjectlogItemComponent {

    private _item: Projectlog;
    private changed: boolean = false;
    private beforeChange: BeforeChange = {
        title: '',
        description: ''
    };

    statusOptions: DropdownOption[] = [{
        text: 'new'
    }, {
            text: 'doing'
        }, {
            text: 'done'
        }, {
            text: 'hold'
        }];


    @Output() statusUpdate: EventEmitter<Projectlog> = new EventEmitter<Projectlog>();

    constructor(private service: ProjectlogService) { }

    private fireStatusUpdate() {
        this.statusUpdate.next(this.item);
    }

    get item() {
        return this._item;
    }

    @Input() set item(value: Projectlog) {
        this._item = value;
        this._item.uiState = {
            open: false,
            selected: false,
            editMode: false
        };
    }

    toggleOpen(event: any) {
        event.stopPropagation();
        if (!this.item.uiState.editMode) {
            this.item.uiState.open = !this.item.uiState.open;
            this.fireStatusUpdate();
        }
    }

    toggleSelection(event: any) {
        event.stopPropagation();
        this.item.uiState.selected = !this.item.uiState.selected;
        this.fireStatusUpdate();
    }

    toggleEdit(event: any) {
        event.stopPropagation();
        if (this.item.uiState.editMode) {
            if (this.changed) {
                console.warn('The changes are lost!');
                this.item.title = this.beforeChange.title;
                this.item.description = this.beforeChange.description;
            }
        } else {
            this.changed = false;
            this.beforeChange = {
                title: this.item.title,
                description: this.item.description
            };
        }

        this.item.uiState.editMode = !this.item.uiState.editMode;
    }

    save() {
        this.service.update(this.item).then(function() { console.log('done'); });
    }

    switchToEditMode(event: any) {
        event.stopPropagation();
        if (!this.item.uiState.editMode) {
            this.item.uiState.open = true;
            this.toggleEdit(event);
        }
    }

    preventEvent(event: any) {
        event.stopPropagation();
    }

}
