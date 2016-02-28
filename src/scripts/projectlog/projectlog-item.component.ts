import {Component, View, Input} from 'angular2/core';
import {Projectlog} from './projectlog';
import {ProjectlogService} from './projectlog.service';

interface ItemStatus {
  open: boolean;
  selected: boolean;
}

@Component({
  selector: 'pw-projectlog-item',
  providers: [ProjectlogService]
})
@View({
  template: `
		<!-- the list item-->
		<div class="list-item"
				[class.selected-item]="status.selected"
				[class.open]="status.open"
				(click)="toggleCurrent($event)">
			<div class="avatar fa" (click)="toggleSelection($event)">{{item.title.substr(0, 1).toUpperCase()}}</div>
			<div class="content">
				<div class="heading-row">
					<div class="id">{{item.id}}</div>
					<div class="heading">{{item.title}}</div>
				</div>
				<div class="text">
				<div class="status" [class.grey-text]="item.status==='done'" [class.green-text]="item.status==='doing'"
				 [class.yellow-text]="item.status==='new'">{{item.status}}</div>

				{{item.description}}</div>
			</div>
			<div class="action-bar">
				<a class="fa fa-edit"></a>
				<a class="fa fa-trash"></a>
			</div>
		</div> <!-- end of list item -->
	`
})
export class ProjectlogComponent {

  @Input() item: Projectlog;
  @Input() status: ItemStatus;

  constructor(private service: ProjectlogService) {
    this.status = {
      open: false,
      selected: false
    };
  }

  toggleOpen(event: any) {
    event.stopPropagation();
    this.status.open = !this.status.open;
  }

  toggleSelection(event: any) {
    event.stopPropagation();
    this.status.selected = !this.status.selected;
  }
}
