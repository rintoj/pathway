import {Component, View} from 'angular2/core';
import {Projectlog} from './projectlog';
import {LoaderComponent} from '../loader/loader.component';

@Component({
  selector: 'pw-projectlog'
})
@View({
  directives: [LoaderComponent],
  template: `

		<!-- action buttons -->
		<div class="actions">
			<a class="fa fa-plus" tooltip="Add story"></a>
			<a class="fa fa-trash" tooltip="Delete stories" (click)="deleteSelected()"></a>
			<a class="fa fa-check" tooltip="Toggle selection" (click)="toggleAll()" [class.selected]="selectAllOn"></a>
			<a class="fa fa-refresh" tooltip="Toggle spinner" (click)="loading=!loading"></a>
		</div>

		<div class="separator"></div>

		<!-- the list -->
		<div class="list" [class.loading]="loading">

			<!-- the list item-->
			<div class="list-item" *ngFor="#item of logs" [class.selected-item]="item.selected" [class.open]="item.open"
			 (click)="toggleCurrent(item)">
				<div class="avatar fa" (click)="toggleSelection(item, $event)">{{item.title.substr(0, 1).toUpperCase()}}</div>
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

			<!-- list loader -->
			<div class="list-item loader">
				<pw-loader></pw-loader>
			</div>

		</div> <!-- end of list -->
	`
})
export class ProjectlogComponent {

  private logs: Array<Projectlog>;
  private selectAllOn: boolean = false;
  private currentItem: Projectlog;
  private loading: boolean;

  constructor() {
    this.loading = false;
    this.logs = [{
      id: '02332',
      selected: false,
      title: 'User must be able to login to system as engineer',
      description: 'The navigation drawer on the right is a live demo of a temporary navigation drawer.',
      status: 'new'
    }, {
        id: '02333',
        selected: false,
        title: 'User must be able to logout from the system',
        description: 'The navigation drawer on the right is a live demo of a temporary navigation drawer.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily',
        status: 'new'
      }, {
        id: '02334',
        selected: false,
        title: 'User must be able to see login page when trying to relogin after logout',
        description: 'The navigation drawer on the right is a live demo of a temporary navigation drawer.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.',
        status: 'done'
      }, {
        id: '02334',
        selected: false,
        title: 'User must be able to see login page when trying to relogin after logout',
        description: 'The navigation drawer on the right is a live demo of a temporary navigation drawer.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.',
        status: 'done'
      }, {
        id: '02334',
        selected: false,
        title: 'User must be able to see login page when trying to relogin after logout',
        description: 'The navigation drawer on the right is a live demo of a temporary navigation drawer.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.',
        status: 'doing'
      }, {
        id: '02334',
        selected: false,
        title: 'A user must be able to see login page when trying to relogin after logout',
        description: 'The navigation drawer on the right is a live demo of a temporary navigation drawer.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.' +
        ' Temporary navigation drawers can toggle open or closed. Closed by default, the drawer opens temporarily' +
        ' above all other content until a section is selected.',
        status: 'doing'
      }];
  }

  toggleAll() {
    this.selectAllOn = !this.selectAllOn;
    for (var item of this.logs) {
      item.selected = this.selectAllOn;
    }
  }

  toggleSelection(item: Projectlog, event: any) {
    event.stopPropagation();
    item.selected = !item.selected;
    this.updateSelectAllToggle();
  }

  toggleCurrent(current: Projectlog) {
    current.open = !current.open;
    if (this.currentItem && current !== this.currentItem) {
      this.currentItem.open = false;
    }

    this.currentItem = current;
    this.updateSelectAllToggle();
  }

  updateSelectAllToggle() {
    for (var item of this.logs) {
      if (item.selected === false) {
        this.selectAllOn = false;
        return;
      }
    }

    this.selectAllOn = true;
  }

  deleteSelected() {
    this.logs = this.logs.filter((item: Projectlog) => { return item.selected === false; });
  }
}
