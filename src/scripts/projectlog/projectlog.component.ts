import {Component, View} from 'angular2/core';
import {Projectlog} from './projectlog';
import {ProjectlogService} from './projectlog.service';
import {ProjectlogItemComponent} from './projectlog-item.component';
import {LoaderComponent} from '../loader/loader.component';
import {UploaderComponent} from '../uploader/uploader.component';
import {Page} from '../shared/services/pagination';
import {Promise} from 'angular2/src/facade/promise';
import {InfiniteScroller} from '../shared/directives/scroller/infinite-scroller';

@Component({
  selector: 'pw-projectlog',
  providers: [ProjectlogService]
})
@View({
  directives: [ProjectlogItemComponent, LoaderComponent, UploaderComponent, InfiniteScroller],
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
		<div class="list" [class.loading]="loading" infinite-scroll [infiniteScrollDistance]="2" (scrolled)="onScroll()">

			<!-- the list item-->
			<pw-projectlog-item *ngFor="#item of logs" [item]="item" (update)="onItemUpdate($event)">
			</pw-projectlog-item>

			<!-- list loader -->
			<div class="list-item loader">
				<pw-loader></pw-loader>
			</div>

		</div> <!-- end of list -->

		<div class="error-message" *ngIf="error != undefined"><i class="fa fa-exclamation-triangle"></i> {{error}}</div>
		<pw-uploader [show]="showUploader" (autoHide)="showUploader = false"> </pw-uploader>

		<div class="foot-note">{{logs.length}} of {{page.totalItems}}</div>
	`
})
export class ProjectlogComponent {

  private logs: Projectlog[];
  private selectedCount: number = 0;
  private selectAllOn: boolean = false;
  private loading: boolean;
  private error: string;
  private page: Page<Projectlog[]> = new Page<Projectlog[]>(0, 0);
  private showUploader: boolean = false;

  constructor(private service: ProjectlogService) {
    this.loading = false;
    this.logs = [];
  }

  ngOnInit() {
    this.service.store.subscribe((data: Projectlog[]) => this.logs = data);
    this.refresh();
	 }

  create() {
    console.log('Create is yet to be implemented');
  }

  refresh() {
    this.loading = true;
    this.error = undefined;
    this.processResponse(this.service.fetch());
  }

  processResponse(promise: Promise<Page<Projectlog[]>>) {
    promise.then(

      (page: Page<Projectlog[]>) => {
        this.loading = false;
        this.page = page;
      },

      (error: any) => {
        this.loading = false;
        this.error = 'Unexpected error occured! Contact administrator.';
        console.error(error);
      });
  }

  nextPage() {
    if (this.page !== undefined) {
      var nextPage: Page<Projectlog[]> = this.page.next();
      if (nextPage !== undefined) {
        this.loading = true;
        this.error = undefined;
        this.processResponse(this.service.fetch(nextPage));
      } else {
        console.warn('No more pages');
      }
    }
  }

  showUploadPopup() {
    this.showUploader = true;
  }

  toggleAll() {
    this.selectAllOn = !this.selectAllOn;
    for (var item of this.logs) {
      item.ui.selected = this.selectAllOn;
    }
		this.selectedCount = this.selectAllOn ? this.logs.length : 0;
  }

  onItemUpdate(item: Projectlog) {
    this.selectedCount += item.ui.selected ? 1 : -1;
    this.selectAllOn = this.selectedCount === this.logs.length;
  }

  onScroll() {
    console.warn('Loading next page');
    this.nextPage();
  }

  deleteSelected() {
    this.logs = this.logs.filter((item: Projectlog) => { return item.ui.selected === false; });
  }
}
