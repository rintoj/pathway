import {UIState} from './ui-state';
import {Projectlog} from './projectlog';
import {Observable} from 'rxjs/Observable';
import {PaginatableList} from './pagination';

export interface ApplicationState {
	projectlogs?: PaginatableList<Projectlog>;
	ui?: UIState;
}

export class ApplicationStateObservable extends Observable<ApplicationState> {

}