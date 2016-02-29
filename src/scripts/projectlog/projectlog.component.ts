import {Component, View} from 'angular2/core';
import {Projectlog} from './projectlog';
import {ProjectlogService} from './projectlog.service';
import {ProjectlogItemComponent} from './projectlog-item.component';
import {LoaderComponent} from '../loader/loader.component';
import {UploaderComponent} from '../uploader/uploader.component';

@Component({
  selector: 'pw-projectlog',
  providers: [ProjectlogService]
})
@View({
  directives: [ProjectlogItemComponent, LoaderComponent, UploaderComponent],
  template: `

		<!-- action buttons -->
		<div class="actions">
			<a class="fa fa-plus" tooltip="Add story" (click)="create()"></a>
			<a class="fa fa-trash" tooltip="Delete stories" (click)="deleteSelected()"></a>
			<a class="fa fa-check" tooltip="Toggle selection" (click)="toggleAll()" [class.selected]="selectAllOn"></a>
			<a class="fa fa-refresh" tooltip="Toggle spinner" (click)="refresh()"></a>
			<a class="fa fa-upload" tooltip="Upload sample data" (click)="showUploadPopup()"></a>
		</div>

		<div class="separator"></div>

		<!-- the list -->
		<div class="list" [class.loading]="loading">

			<!-- the list item-->
			<pw-projectlog-item *ngFor="#item of logs" [item]="item"></pw-projectlog-item>

			<!-- list loader -->
			<div class="list-item loader">
				<pw-loader></pw-loader>
			</div>

		</div> <!-- end of list -->

		<pw-uploader [show]="showUploader" (autoHide)="showUploader = false"> </pw-uploader>
	`
})
export class ProjectlogComponent {

  private logs: Projectlog[];
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

  ngOnInit() {
    this.service.store.subscribe((data: any) => { this.logs = data; console.error(data); });
  }

  create() {
    console.log('Create is yet to be implemented');
  }

  refresh() {
    this.loading = true;
    this.service.fetch().then(() => this.loading = false, () => this.loading = false);
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
