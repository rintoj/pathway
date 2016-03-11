import {Page} from '../../state/pagination';
import {Dispatcher} from '../../state/dispatcher';
import {Subject} from 'rxjs/Subject';
import {Component, View} from 'angular2/core';
import {LoaderComponent} from '../loader/loader.component';
import {InfiniteScroller} from '../../directive/scroller/infinite-scroller';
import {ProjectlogService} from '../../service/projectlog.service';
import {UploaderComponent} from '../uploader/uploader.component';
import {ProjectlogItemComponent} from './projectlog-item.component';
import {ApplicationState, ApplicationStateObservable} from '../../state/application-state';
import {Projectlog, FetchProjectlogAction, CreateProjectlogAction, DeleteProjectlogAction} from '../../state/projectlog';

@Component({
    selector: 'pw-projectlog'
})
@View({
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

		<div class="foot-note">{{state.projectlogs?.list?.length}} of {{state.projectlogs?.page?.totalItems}}</div>
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

    constructor(
        private service: ProjectlogService,
        private dispatcher: Dispatcher,
        private stateObservable: ApplicationStateObservable
    ) {
        this.loading = false;
    }

    ngOnInit() {
        this.stateObservable.subscribe((state: ApplicationState) => this.state = state);
        this.fetchPageAction = new Subject<Page<Projectlog>>();
        this.fetchPageAction.debounceTime(1000).subscribe((page: Page<Projectlog>) => this.requestPage(page));
        this.refresh();
    }

    create() {
        console.log('Create is yet to be implemented');
        this.dispatcher.next(new CreateProjectlogAction(null));
    }

    refresh() {
        this.loading = true;
        this.error = undefined;
        this.fetchPageAction.next(new Page(0).setFilters(this.filters));
    }

    nextPage() {
        this.loading = true;
        this.error = undefined;
        this.fetchPageAction.next(this.state.projectlogs.page.next());
    }

    private requestPage(page: Page<Projectlog>) {
        console.log('request:', page);

        this.dispatcher.next(new FetchProjectlogAction(page)).subscribe(
            (x: ApplicationState) => {
                this.loading = false;
                console.log('response:', this.state.projectlogs.page);
            },
            (error: any) => { this.error = 'Error occured'; console.error('error', error); }
        );
    }

    get filters() {
        return { sort: { index: { order: 'asc' } } };
    }

    showUploadPopup() {
        this.showUploader = true;
    }

    toggleAll() {
        this.selectAllOn = !this.selectAllOn;
        // for (var item of this.logs) {
        // 	item.uiState.selected = this.selectAllOn;
        // }
        // this.selectedCount = this.selectAllOn ? this.logs.length : 0;
    }

    toggleSort() {
        this.sortAsc = !this.sortAsc;
        this.refresh();
    }

    onItemUpdate(item: Projectlog) {
        this.selectedCount += item.uiState.selected ? 1 : -1;
        // this.selectAllOn = this.selectedCount === this.logs.length;
    }

    deleteSelected() {
        this.dispatcher.next(new DeleteProjectlogAction(null));
        // this.logs = this.logs.filter((item: Projectlog) => { return item.uiState.selected === false; });
    }
}
