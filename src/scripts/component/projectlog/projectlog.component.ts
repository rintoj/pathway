import {Page} from '../../state/pagination';
import {Subject} from 'rxjs/Rx';
import {Dispatcher} from '../../state/dispatcher';
import {Projectlog} from '../../state/projectlog';
import {Component} from '@angular/core';
import {LoaderComponent} from '../loader/loader.component';
import {InfiniteScroller} from '../../directive/scroller/infinite-scroller';
import {UploaderComponent} from '../uploader/uploader.component';
import {ProjectlogItemComponent} from './projectlog-item.component';
import {ApplicationState, ApplicationStateObservable} from '../../state/application-state';
import {FetchProjectlogAction, CreateProjectlogAction, DeleteProjectlogAction} from '../../state/action';

@Component({
  selector: 'pw-projectlog',
  directives: [
    ProjectlogItemComponent,
    LoaderComponent,
    UploaderComponent,
    InfiniteScroller
  ],
  template: `

		<!-- action buttons -->
		<div class="actions">
			<a class="btn btn-round fa fa-plus" tooltip="Add story" (click)="create()"></a>
			<a class="btn btn-round fa fa-trash" tooltip="Delete stories" (click)="deleteSelected()"></a>
			<a class="btn btn-round fa fa-check" tooltip="Toggle selection" (click)="toggleAll()"
			[class.selected]="selectAllOn"></a>
			<a class="btn btn-round fa fa-refresh" tooltip="Toggle spinner" (click)="refresh()"></a>
			<a class="btn btn-round fa fa-upload" tooltip="Upload sample data" (click)="showUploadPopup()"></a>
			<a class="btn btn-round fa fa-sort-numeric-asc" [class.desc]="!sortAsc" tooltip="Sort" (click)="toggleSort()"></a>
		</div>

		<div class="separator"></div>

		<!-- the list -->
		<div class="list" [class.loading]="loading" infinite-scroll [infiniteScrollDistance]="2" (scrolled)="nextPage()">

			<!-- the list item-->
			<pw-projectlog-item *ngFor="#item of state.projectlogs.list" [item]="item" (update)="onItemUpdate($event)">
			</pw-projectlog-item>

			<!-- list loader -->
			<div class="list-item loader">
				<pw-loader></pw-loader>
			</div>

		</div> <!-- end of list -->

		<div class="error-message" *ngIf="error != undefined"><i class="fa fa-exclamation-triangle"></i> {{error}}</div>
		<pw-uploader [show]="showUploader" (autoHide)="showUploader = false"> </pw-uploader>

		<div class="foot-note">{{state.projectlogs?.list?.size}} of {{state.projectlogs?.page?.totalItems}}</div>
	`
})
export class ProjectlogComponent {

  private state: ApplicationState;
  private selectedCount: number = 0;
  private selectAllOn: boolean = false;
  private sortAsc: boolean = true;
  private loading: boolean;
  private error: string;
  private showUploader: boolean = false;

  private fetchPageAction: Subject<Page<Projectlog>>;

  constructor(private dispatcher: Dispatcher, private stateObservable: ApplicationStateObservable) {
    this.loading = false;
  }

  ngOnInit(): void {
    this.stateObservable.subscribe((state: ApplicationState) => this.state = state);
    // this.fetchPageAction = new Subject<Page<Projectlog>>();
    // this.fetchPageAction.debounceTime(100).subscribe((page: Page<Projectlog>) => this.requestPage(page));
    // this.refresh();
  }

  create(): void {
    console.log('Create is yet to be implemented');
    this.dispatcher.next(new CreateProjectlogAction(null));
  }

  refresh(): void {
    this.loading = true;
    this.error = undefined;
    this.fetchPageAction.next(new Page(0).setFilters(this.filters));
  }

  nextPage(): void {
    if (this.loading) {
      return null; // do nothing
    }
    this.loading = true;
    this.error = undefined;
    this.fetchPageAction.next(this.state.projectlogs.page.next());
  }

  protected requestPage(page: Page<Projectlog>): void {
    console.log('request:', page);

    this.dispatcher.next(new FetchProjectlogAction(page))
      .finally(() => {
        this.loading = false;
      }).subscribe((state: ApplicationState) => {
        console.log('response:', this.state.projectlogs.page);
      }, (error: any) => {
        this.error = 'Error occured';
        console.error('error', error);
      });
  }

  get filters(): Object {
    return { sort: { index: { order: this.sortAsc ? 'asc' : 'desc' } } };
  }

  showUploadPopup(): void {
    this.showUploader = true;
  }

  toggleAll(): void {
    this.selectAllOn = !this.selectAllOn;
    // for (var item of this.logs) {
    // 	item.uiState.selected = this.selectAllOn;
    // }
    // this.selectedCount = this.selectAllOn ? this.logs.length : 0;
  }

  toggleSort(): void {
    this.sortAsc = !this.sortAsc;
    this.refresh();
  }

  onItemUpdate(item: Projectlog): void {
    this.selectedCount += item.uiState.selected ? 1 : -1;
    // this.selectAllOn = this.selectedCount === this.logs.length;
  }

  deleteSelected(): void {
    this.dispatcher.next(new DeleteProjectlogAction(null));
    // this.logs = this.logs.filter((item: Projectlog) => { return item.uiState.selected === false; });
  }
}
