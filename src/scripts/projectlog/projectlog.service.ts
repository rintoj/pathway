import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import {Response} from 'angular2/http';
import {RestService} from '../shared/services/rest.service';
import {Projectlog} from './projectlog';
import {PromiseWrapper} from 'angular2/src/facade/promise';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Injectable()
export class ProjectlogService {

  public store: Observable<Projectlog[]>;
  private url: string = 'projectlog';
  private data: Projectlog[];
  private observer: any;

  constructor(private rest: RestService) {
    this.store = new Observable((observer: any) => this.observer = observer).share();
    this.data = [];
  }

  private publish(): ProjectlogService {
    this.observer.next(this.data);
    return this;
  }

  private mapResponse(response: Response): Projectlog[] {
    return response.json().hits.hits.map((item: any) => { return item._source; });
  }

  fetch(): any {
    var completer = PromiseWrapper.completer();
    completer.promise.then((x: any) => console.log(x), (err: any) => console.error(err));

    return this.rest.read(`${this.url}/_search`)
      .map(this.mapResponse)
      .subscribe((data: Projectlog[]) => {
      	this.data = data;
      	this.publish();
    	});
  }

  create(projectlog: Projectlog): ProjectlogService {
    this.data.unshift(projectlog);
    this.rest.create(this.url, projectlog).map((res: Response) => res.json()).subscribe(() => this.publish());
    return this;
  }

  // update(projectlog: Projectlog): void {
  //   this.rest.update(`${this.url}/${projectlog.id}`, projectlog)
  //     .subscribe(() => console.log('updated!'));
  // }

  delete(projectlog: Projectlog): ProjectlogService {
    this.data.splice(this.data.indexOf(projectlog), 1);
    this.rest.delete(`${this.url}/${projectlog.id}`).map((res: Response) => res.json())
      .subscribe(() => this.publish());
    return this;
  }
}
