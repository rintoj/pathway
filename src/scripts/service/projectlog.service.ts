import {Page} from './pagination';
import {Action} from '../state/actions';
import {Response} from 'angular2/http';
import {Dispatcher, Service} from '../state/dispatcher';
import {Observable} from 'rxjs/Observable';
import {Projectlog} from '../state/projectlog';
import {RestService} from './rest.service';
import {ApplicationState} from '../state/application-state';
import {Injectable, Inject} from 'angular2/core';
import {Promise, PromiseWrapper} from 'angular2/src/facade/promise';

@Injectable()
export class ProjectlogService implements Service {

  public store: Observable<Projectlog[]>;
  private url: string = 'projectlog';
  private data: Projectlog[];
  private observer: any;
  private defaultPageSize: number = 10;

  constructor(
    private rest: RestService,
    private dispatcher: Dispatcher,
    @Inject('state') private state: Observable<ApplicationState>
    ) {
    this.store = new Observable((observer: any) => this.observer = observer).share();
    this.data = [];

    dispatcher.subscribe(this);
  }

  transform(state: ApplicationState, action: Action): ApplicationState {
    console.warn('ProjectlogService processing action', action);
    return state;
  }

  private publish(data: Projectlog[]): ProjectlogService {
    this.observer.next(this.data);
    return this;
  }

  private mapResponse(response: Response, page: Page<any>): Page<Projectlog[]> {
    var json = response.json();

    page = page ? page : new Page<Projectlog[]>(json.hits.total, this.defaultPageSize);
    page.data = json.hits.hits.map((item: any) => {
      item._source.id = item._id;
      return item._source;
    });

    return page;
  }

  fetch(page?: Page<any>, sortAsc: boolean = true): Promise<any> {
    var defer = PromiseWrapper.completer();

    this.rest.read(`${this.url}/_search`, (page === undefined) ? undefined : page.currentIndex(), {
      'sort': { 'index': { 'order': sortAsc ? 'asc' : 'desc' } }
    })
      .map((response: Response) => this.mapResponse(response, page))
      .subscribe(

      (data: Page<Projectlog[]>) => {
        if (page !== undefined) {
          this.data = this.data.concat(data.data);
        } else {
          this.data = data.data;
        }
        this.publish(data.data);
        defer.resolve(data);
      },

      defer.reject);

    return defer.promise;
  }

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