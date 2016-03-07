import {ProjectlogService} from '../../service/projectlog.service';
import {Projectlog} from '../../state/projectlog';
import {Component, View, Input, Output, EventEmitter} from 'angular2/core';

@Component({
  selector: 'pw-projectlog-item'
})
@View({
  template: `
		<div class="list-item" (click)="toggleOpen($event)" [class.open]="item.uiState.open"
			[class.selected-item]="item.uiState.selected" [class.edit-mode]="editMode">
			<!-- the list item-->
			<div class="avatar fa" (click)="toggleSelection($event)">{{item.title.substr(0, 1).toUpperCase()}}</div>

			<div class="content">
				<div class="heading-row">
					<div class="heading">{{item.title}}</div>
				</div>

				<div class="text">
					<div class="status">{{item.index}}</div>
					<div class="status" [class.grey-text]="item.status==='done'" [class.green-text]="item.status==='doing'"
					 [class.yellow-text]="item.status==='new'">{{item.status}}</div>
				 	<div class="id">{{item.id}}</div>
				</div>

				<span class="description">{{item.description}}</span>
			</div>
			<div class="action-bar">
				<a class="fa fa-edit" (click)="toggleEdit()"></a>
				<a class="fa fa-trash"></a>
			</div>
		</div>
	`
})
export class ProjectlogItemComponent {

  @Input() item: Projectlog;
  @Output() statusUpdate: EventEmitter<Projectlog> = new EventEmitter<Projectlog>();

	private editMode:boolean = false;

  constructor(private service: ProjectlogService) { }

  private fireStatusUpdate() {
    this.statusUpdate.next(this.item);
  }

  toggleOpen(event: any) {
    event.stopPropagation();
    this.item.uiState.open = !this.item.uiState.open;
    this.fireStatusUpdate();
  }

  toggleSelection(event: any) {
    event.stopPropagation();
    this.item.uiState.selected = !this.item.uiState.selected;
    this.fireStatusUpdate();
  }

	toggleEdit() {
		this.editMode = !this.editMode;
	}

}
