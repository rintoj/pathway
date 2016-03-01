
import {Observable} from 'rxjs/Observable';
import {Action} from './actions';
import {ApplicationState} from './application-state';
import {calculateTodos, calculateUiState} from './reducers';
import {BehaviorSubject} from 'rxjs/Rx';

export class StateFactory {

  static wrapIntoBehaviorSubject(initialState: any, observable: any) {
    const response: any = new BehaviorSubject(initialState);
    observable.subscribe((s: any) => response.next(s));
    return response;
  };

  static create(initialState: ApplicationState, actions: Observable<Action>): Observable<ApplicationState> {

    let appStateObservable = actions.scan((state: ApplicationState, action: Action) => {

      // console.log('Processing action ' + action.getName());

			// Add states here for transformation
      let newState: ApplicationState = {
        todos: calculateTodos(state.todos, action),
        uiState: calculateUiState(state.uiState, action)
      };

      console.log({
        todos: newState.todos.toJS(),
        uiState: newState.uiState
      });

      return newState;

    }, initialState)
      .share();

    return StateFactory.wrapIntoBehaviorSubject(initialState, appStateObservable);
  }

}
