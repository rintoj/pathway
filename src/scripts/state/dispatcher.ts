import {Action} from './actions';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/Rx';
import {IApplicationState, ApplicationState} from './application-state';

export interface Service {
  transform(state: ApplicationState, action: Action): ApplicationState;
}

export class Dispatcher {

  private actions: Subject<Action> = new Subject<Action>();
  private subscriptions: Service[] = [];
  private state: Observable<ApplicationState>;

  constructor(initialState: ApplicationState) {
    this.state = this.createState(initialState);
  }

  subscribe(service: Service) {
    this.subscriptions.push(service);
  }

  unsubscribe(service: Service) {
    var index = this.subscriptions.indexOf(service);
    if (index >= 0) {
      this.subscriptions.splice(index, 1);
    }
  }

  next(action: Action) {
    this.actions.next(action);
  }

  private createState(initialState: IApplicationState): Observable<ApplicationState> {

    let immutableInitialState = new ApplicationState(initialState);

    let observableState = this.actions.scan((state: ApplicationState, action: Action) => {

      console.log('Processing action: ', action);

      let nextState: ApplicationState = state;
      this.subscriptions.map((service: Service) => {
        nextState = service.transform(nextState, action);
      });

      return nextState;
    }, immutableInitialState).share();

    // initial state is being wrapped into BehaviourSubject;
    const response = new BehaviorSubject(immutableInitialState);
    observableState.subscribe((s: ApplicationState) => response.next(s));
    return response;
  };

  static stateFactory(dispatcher: Dispatcher): Observable<ApplicationState> {
    return dispatcher.state;
  }
}
