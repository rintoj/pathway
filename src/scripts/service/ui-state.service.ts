import {Dispatcher} from '../state/dispatcher';
import {ApplicationStateObservable} from '../state/application-state';
import {Injectable} from 'angular2/core';

@Injectable()
export class UIStateService {

	constructor(
		private dispatcher: Dispatcher,
		private state: ApplicationStateObservable
    ) {
		// dispatcher.subscribe(this);
	}

	//   private changeSyncStatus(state: ApplicationState, action: ChangeSycingAction): ApplicationState {
	//     let nextState: any = state.mergeDeep({ uiState: { sycing: action.sync } });
	//     return nextState;
	//   }

}
