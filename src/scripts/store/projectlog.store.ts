import {Page} from '../state/pagination';
import {Response} from 'angular2/http';
import {Dispatcher} from '../state/dispatcher';
import {Observable} from 'rxjs/Observable';
import {Projectlog}  from '../state/projectlog';
import {ApplicationState} from '../state/application-state';
import {Injectable, Inject} from 'angular2/core';
import {RestServiceWithOAuth2} from '../service/oauth2-rest.service';
import {FetchProjectlogAction, CreateProjectlogAction, DeleteProjectlogAction} from '../state/action';

@Injectable()
export class ProjectlogStore {

  // private url: string = 'projectlog';

  constructor(@Inject('DataService') private dataService: RestServiceWithOAuth2, dispatcher: Dispatcher) {
    this.subscribeToDispatcher(dispatcher);
  }

  private subscribeToDispatcher(dispatcher: Dispatcher) {
    dispatcher.subscribe([new FetchProjectlogAction(null)], this.fetchProjectlog.bind(this));
    dispatcher.subscribe([new CreateProjectlogAction(null)], this.createProjectlog.bind(this));
    dispatcher.subscribe([new DeleteProjectlogAction(null)], this.deleteProjectlog.bind(this));
  }

  private createProjectlog(state: ApplicationState, action: CreateProjectlogAction): ApplicationState {
    console.log('createProjectlogAction', state, action);
    state.ui.syncing = true;
    return state;
  }

  private deleteProjectlog(state: ApplicationState, action: DeleteProjectlogAction): ApplicationState {
    console.log('deleteProjectlogAction', state, action);
    state.ui.syncing = false;
    return state;
  }

  private fetchProjectlog(state: ApplicationState, action: FetchProjectlogAction): Observable<ApplicationState> {
    // return this.dataService.get(`${this.url}/_search`, action.page.currentIndex(), action.page.filters)
    //   .map((response: Response): ApplicationState => this.mapResponse(response, action.page))
    //   .map((s: ApplicationState) => {
    //     if (s.projectlogs.page.currentPage === 0) {
    //       state.projectlogs.list = s.projectlogs.list;
    //     } else {
    //       state.projectlogs.list = state.projectlogs.list.concat(s.projectlogs.list);
    //     }
    //     state.projectlogs.page = s.projectlogs.page;
    //     return state;
    //   });
    return null;
  }

  protected mapResponse(response: Response, page: Page<any>): ApplicationState {
    var json = response.json();

    let nextPage: Page<Projectlog> = page ? page.setTotalItems(json.hits.total) : new Page<Projectlog>(json.hits.total);
    let data: Projectlog[] = json.hits.hits.map((item: any) => {
      item._source.id = item._id;
      return <Projectlog>item._source;
    });

    return { projectlogs: { page: nextPage, list: data } };
  }

  // fetch(page?: Page<any>, sortAsc: boolean = true): Promise<any> {
  //     var defer = PromiseWrapper.completer();

  //     this.rest.read(`${this.url}/_search`, (page === undefined) ? undefined : page.currentIndex(), {
  //         'sort': {
  //             'index': {
  //                 'order': sortAsc ? 'asc' : 'desc'
  //             }
  //         }
  //     })
  //         .map((response: Response) => this.mapResponse(response, page))
  //         .subscribe(

  //         (data: Page<Projectlog[]>) => {
  //             if (page !== undefined) {
  //                 this.data = this.data.concat(data.data);
  //             } else {
  //                 this.data = data.data;
  //             }
  //             this.publish(data.data); 
  //             defer.resolve(data);
  //         },

  //         defer.reject);

  //     return defer.promise;
  // }

  // update(projectlog: Projectlog): Promise<any> {
  //     var defer = PromiseWrapper.completer();
  //     this.rest.update(`${this.url}/${projectlog.id}`, projectlog)
  //         .subscribe(defer.resolve, defer.reject);
  //     return defer.promise;
  // }

  // create(projectlog: Projectlog): ProjectlogService {
  //   this.data.unshift(projectlog);
  //   this.rest.create(this.url, projectlog).map((res: Response) => res.json()).subscribe(this.publish);
  //   return this;
  // }

  // update(projectlog: Projectlog): void {
  //   this.rest.update(`${this.url}/${projectlog.id}`, projectlog)
  //     .subscribe(() => console.log('updated!'));
  // }

  // delete(projectlog: Projectlog): ProjectlogService {
  //   this.data.splice(this.data.indexOf(projectlog), 1);
  //   this.rest.delete(`${this.url}/${projectlog.id}`).map((res: Response) => res.json())
  //     .subscribe(this.publish);
  //   return this;
  // }
}