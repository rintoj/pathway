import {Component, View, Input, Output, EventEmitter} from 'angular2/core';
import {Projectlog} from '../../state/projectlog';
import {ProjectlogService} from '../../service/projectlog.service';

interface ItemStatus {
  open: boolean;
  selected: boolean;
}

@Component({
  selector: 'pw-projectlog-item',
  providers: [ProjectlogService],
  host: {
    '[class.open]': 'item.ui.open',
    '[class.selected-item]': 'item.ui.selected',
    '(click)': 'toggleOpen($event)'
  }
})
@View({
  template: `
		<!-- the list item-->
		<div class="avatar fa" (click)="toggleSelection($event)">{{item.title.substr(0, 1).toUpperCase()}}</div>

		<div class="content">
			<div class="heading-row">
				<div class="heading">{{item.title}}</div>
			</div>

			<div class="text">
				<div class="separator"></div>
				<div class="status">{{item.index}}</div>
				<div class="status" [class.grey-text]="item.status==='done'" [class.green-text]="item.status==='doing'"
				 [class.yellow-text]="item.status==='new'">{{item.status}}</div>
			 	<div class="id">{{item.id}}</div>

				<div class="separator"></div>

				{{item.description}}
			</div>
		</div>
		<div class="action-bar">
			<a class="fa fa-edit"></a>
			<a class="fa fa-trash"></a>
		</div>
	`
})
export class ProjectlogItemComponent {

  _item: Projectlog;
  @Output() update: EventEmitter<Projectlog> = new EventEmitter();

  constructor(private service: ProjectlogService) {

  }

  get item(): Projectlog {
    return this._item;
  }

  @Input() set item(item: Projectlog) {
    this._item = item;
    if (this._item.ui === undefined) {
      this._item.ui = {
        selected: false,
        open: false
      };
    }
  }

  toggleOpen(event: any) {
    event.stopPropagation();
    this.item.ui.open = !this.item.ui.open;
    this.update.next(this.item);
  }

  toggleSelection(event: any) {
    event.stopPropagation();
    this.item.ui.selected = !this.item.ui.selected;
    this.update.next(this.item);
  }

}
