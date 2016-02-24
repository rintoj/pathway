import 'rxjs/add/operator/map';

import {Injectable} from 'angular2/core';
import {Response} from 'angular2/http';

import {RestService} from '../shared/services/rest.service';
import {Projectlog} from './projectlog';

@Injectable()
export class TodoService {
  public projectlog: Projectlog[] = [];

  constructor(private rest: RestService) { }

  fetch(): void {
    this.rest.read('/projectlog', { userId: 1 })
      .map((res: Response) => res.json())
      .subscribe((projectlog: Projectlog[]) => this.projectlog = projectlog);
  }

  create(projectlog: Projectlog): void {
    this.projectlog.unshift(projectlog);

    this.rest.create('/projectlog', projectlog)
      .subscribe(() => console.log('created!'));
  }

  update(projectlog: Projectlog): void {
    this.rest.update(`/projectlog/${projectlog.id}`, projectlog)
      .subscribe(() => console.log('updated!'));
  }

  delete(projectlog: Projectlog): void {
    this.projectlog.splice(this.projectlog.indexOf(projectlog), 1);

    this.rest.delete(`/projectlog/${projectlog.id}`)
      .subscribe(() => console.log('deleted!'));
  }
}
