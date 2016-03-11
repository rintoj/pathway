import {UIState} from './ui-state';
import {Projectlog} from './projectlog';
import {Observable} from 'rxjs/Observable';
import {PagenatedList} from './pagination';

export interface ApplicationState {
	projectlogs: PagenatedList<Projectlog>;
	ui: UIState;
}

export class ApplicationStateObservable extends Observable<ApplicationState> {

}