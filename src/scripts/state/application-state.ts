import {UIState} from './ui-state';
import {Projectlog} from './projectlog';
import {Observable} from 'rxjs/Observable';

export interface ApplicationState {
	projectlogs: Projectlog[];
	ui: UIState;
}

export class ApplicationStateObservable extends Observable<ApplicationState> {

}