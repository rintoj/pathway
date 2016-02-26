import {Component, View} from 'angular2/core';
import {Projectlog} from './projectlog';
import {ProjectlogService} from './projectlog.service';
import {LoaderComponent} from '../loader/loader.component';
import {UploaderComponent} from '../uploader/uploader.component';

@Component({
  selector: 'pw-projectlog',
  providers: [ProjectlogService]
})
@View({
  directives: [LoaderComponent, UploaderComponent],
  template: `

		<!-- action buttons -->
		<div class="actions">
			<a class="fa fa-plus" tooltip="Add story" (click)="create()"></a>
			<a class="fa fa-trash" tooltip="Delete stories" (click)="deleteSelected()"></a>
			<a class="fa fa-check" tooltip="Toggle selection" (click)="toggleAll()" [class.selected]="selectAllOn"></a>
			<a class="fa fa-refresh" tooltip="Toggle spinner" (click)="loading=!loading"></a>
			<a class="fa fa-upload" tooltip="Upload sample data" (click)="showUploadPopup()"></a>
		</div>

		<div class="separator"></div>

		<!-- the list -->
		<div class="list" [class.loading]="loading">

			<!-- the list item-->
			<div class="list-item" *ngFor="#item of logs"
					[class.selected-item]="status[item.id].selected"
					[class.open]="status[item.id].open"
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

		<pw-uploader [show]="showUploader" (autoHide)="showUploader = false"> </pw-uploader>
	`
})
export class ProjectlogComponent {

  private logs: Array<Projectlog>;
  private selectAllOn: boolean = false;
  private currentItem: Projectlog;
  private loading: boolean;
  private status: any;
  private showUploader: boolean = false;

  constructor(private service: ProjectlogService) {
    this.loading = false;
    this.logs = [];
    this.status = {};
  }

  create() {
    console.log('Create is yet to be implemented');
  }

  showUploadPopup() {
    this.showUploader = true;
  }

  toggleAll() {
    this.selectAllOn = !this.selectAllOn;
    for (var item of this.logs) {
      this.status[item.id].selected = this.selectAllOn;
    }
  }

  toggleSelection(item: Projectlog, event: any) {
    event.stopPropagation();
    this.status[item.id].selected = !this.status[item.id].selected;
    this.updateSelectAllToggle();
  }

  toggleCurrent(current: Projectlog) {
    this.status[current.id].open = !this.status[current.id].open;
    if (this.currentItem && current !== this.currentItem) {
      this.status[this.currentItem.id].open = false;
    }

    this.currentItem = current;
    this.updateSelectAllToggle();
  }

  updateSelectAllToggle() {
    for (var item of this.logs) {
      if (this.status[item.id].selected === false) {
        this.selectAllOn = false;
        return;
      }
    }

    this.selectAllOn = true;
  }

  deleteSelected() {
    this.logs = this.logs.filter((item: Projectlog) => { return this.status[item.id].selected === false; });
  }
}
