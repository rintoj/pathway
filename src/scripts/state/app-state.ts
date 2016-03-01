import {List} from 'immutable';
import {Action} from './actions';
import {Projectlog} from './projectlog';
import {Observable} from 'rxjs/Observable';
import {OpaqueToken} from 'angular2/core';
import {BehaviorSubject} from 'rxjs/Rx';
import {ProjectlogService} from '../service/projectlog.service';
import {UIState, initialUIState} from './ui-state';

export const state = new OpaqueToken('state');
export const dispatcher = new OpaqueToken('dispatcher');
export const initialState = new OpaqueToken('initialState');
export const initalAppState = { todos: List([]), uiState: initialUIState };

export interface AppState {
  projectlogs: List<Projectlog>;
  uiState: UIState;
}

export class ActionStateFactory {

  constructor(private projectlogService: ProjectlogService) { };

  stateFactory(initialState: AppState, actions: Observable<Action>): Observable<AppState> {

    let observableState = actions.scan((state: AppState, action: Action) => {

      let nextState: AppState = {
        projectlogs: state.projectlogs, // this.projectlogService.process(state.projectlogs, action),
        uiState: state.uiState
      };

      console.log({
        todos: nextState.projectlogs,
        uiState: nextState.uiState
      });

      return nextState;

    }, initialState).share();

    // inital state is being wrapped into BehaviourSubject;
    const response = new BehaviorSubject(initialState);
    observableState.subscribe((s: any) => response.next(s));
    return response;
  }

};
