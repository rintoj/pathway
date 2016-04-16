import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {Dispatcher} from '../state/dispatcher';
import {ApplicationState} from '../state/application-state';
import {SetApplicationStatusAction} from '../state/ui-state';
import {ApplicationStateObservable} from '../state/application-state';
import {Injectable} from 'angular2/core';

@Injectable()
export class UIStateService {

  constructor(
    private dispatcher: Dispatcher,
    private stateObservable: ApplicationStateObservable
  ) {
    this.subscribeToDispatcher(dispatcher);
    this.stateObservable.subscribe(this.setApplicationStatus.bind(this));
  }

  private subscribeToDispatcher(dispatcher: Dispatcher) {
    dispatcher.subscribe([new SetApplicationStatusAction(null)], this.setApplicationStatus.bind(this));
  }

  private setApplicationStatus(state: ApplicationState, action: SetApplicationStatusAction): Observable<ApplicationState> {
    return Observable.create((observer: Observer<ApplicationState>) => {
      state.ui.applicationStatus = action.applicationStatus;
      observer.next(state);
      observer.complete();
    });
  }

}
