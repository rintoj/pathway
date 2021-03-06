import {User} from './user';
import {UIState} from './ui-state';
import {Projectlog} from './projectlog';
import {Observable} from 'rxjs/Rx';
import {PaginatableList} from './pagination';

export interface ApplicationState {
  projectlogs?: PaginatableList<Projectlog>;
  ui?: UIState;
  user?: User;
}

export class ApplicationStateObservable extends Observable<ApplicationState> { }
