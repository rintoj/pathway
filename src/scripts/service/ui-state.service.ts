import {Action, ChangeSycingAction} from '../state/actions';
import {Dispatcher, Service} from '../state/dispatcher';
import {Observable} from 'rxjs/Observable';
import {ApplicationState} from '../state/application-state';
import {Injectable, Inject} from 'angular2/core';

@Injectable()
export class UIStateService implements Service {

  constructor(
    private dispatcher: Dispatcher,
    @Inject('state') private state: Observable<ApplicationState>
    ) {
    dispatcher.subscribe(this);
  }

  transform(state: ApplicationState, action: Action): ApplicationState {
    if (action instanceof ChangeSycingAction) {
      return this.changeSyncStatus(state, action);
    }

    return state;
  }

  private changeSyncStatus(state: ApplicationState, action: ChangeSycingAction): any {
    // return state.mergeDeep({ uiState: { sycing: action.sync } });
		return state;
  }

}
