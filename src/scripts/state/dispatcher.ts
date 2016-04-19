/**
 * @author rintoj (Rinto Jose)
 * @license The MIT License (MIT)
 *
 * Copyright (c) 2016 rintoj
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the " Software "), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED " AS IS ", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {Observer} from 'rxjs/Observer';
import {Immutable}  from './immutable';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/Rx';
import {Action, StatelessAction} from './action';
import {ApplicationState, ApplicationStateObservable} from './application-state';

/**
 * Defines a function that can perform an action
 *
 * @export
 * @interface ServiceFunction
 */
export interface ServiceFunction {
  (state: ApplicationState, action: Action): Observable<ApplicationState>;
}

/**
 * Dispatcher dispatches actions to subscribed services and then merge back the partial application state
 * returned by services with the original application state. 
 * 
 * @export
 * @class Dispatcher
 */
export class Dispatcher {

  private state: ApplicationState;
  private subscriptions: any = {};
  private stateObserver: Observer<ApplicationState>;
  private stateObservable: ApplicationStateObservable;

  /**
   * The factory for creating the initial application state
   * 
   * @static
   * @param {Dispatcher} dispatcher Application's default dispatcher
   * @returns {ApplicationStateObservable} Returns application state as an observable
   */
  static stateFactory(dispatcher: Dispatcher): ApplicationStateObservable {
    return dispatcher.stateObservable;
  }

  /**
   * Creates an instance of Dispatcher.
   * 
   * @param {ApplicationState} initialState (description)
   */
  constructor(initialState: ApplicationState) {

    // set initial state
    this.state = initialState;

    // create state observable
    this.stateObservable = this.wrapIntoBehaviourSubject(
      this.makeImmutable(this.state),
      ApplicationStateObservable.create((observer: Observer<ApplicationState>) => this.stateObserver = observer).share()
    );
  }

  /**
   * Make this object immutable
   * 
   * @protected
   * @param {Object} object The object needs to coverted to immutable 
   * @returns The immutable copy of the given object
   */
  protected makeImmutable(object: Object) {
    console.time('makeImmutable');
    let immutable: any = Immutable.fromJS(object, (key: any, value: any) => {
      if (Immutable.Iterable.isIndexed(value)) {
        return value.toList();
      }

      // convert every object into a record
      value = value.toObject();
      let ImmutableObject = Immutable.Record(value);
      return new ImmutableObject(value);
    });
    console.timeEnd('makeImmutable');
    return immutable;
  }

  /**
   * Make the object mutable so that services can edit it directly.
   * 
   * @protected
   * @param {*} object (description)
   * @returns (description)
   */
  protected makeMutable(object: any) {
    return object && (object.toJS ? object.toJS() : object);
  }

	/**
	 * Wrap application state observable into BehaviourSubject so that the initial value at each .subscribe() will be returned.
	 *
	 * @private
	 * @param {ApplicationState} intialState (description)
	 * @param {ApplicationStateObservable} observableState (description)
	 * @returns {ApplicationStateObservable} (description)
	 */
  private wrapIntoBehaviourSubject(
    intialState: ApplicationState,
    observableState: ApplicationStateObservable
  ): ApplicationStateObservable {
    let wrappedSubject: BehaviorSubject<ApplicationState> = new BehaviorSubject<ApplicationState>(intialState);
    observableState.subscribe((s: ApplicationState) => wrappedSubject.next(s));
    return wrappedSubject;
  }

	/**
	 * Merge previous application state with the new application state, obtained by calling services
	 * 
	 * @private
	 * @param {ApplicationState} state Next application state obtained from service
	 * @returns {ApplicationState} New merged application state
	 */
  protected mergeAppState(state: ApplicationState): ApplicationState {
    let merger = (previous: any, next: any) => {
      if (Immutable.List.isList(previous) && Immutable.List.isList(next)) {
        return previous.concat(next);
      } else if (previous && previous.mergeWith) {
        return previous.mergeWith(merger, next);
      }
      return next;
    };

    return state;
  }

  /**
   * Subscribe to an action.
   * 
   * @param {Action[]} actions Actions as array
   * @param {ServiceFunction} callback Callback for each action
   */
  subscribe(actions: Action[], callback: ServiceFunction) {
    for (let action of actions) {
      let actionIdentity: any = action.constructor;
      if (!this.subscriptions[actionIdentity]) {
        this.subscriptions[actionIdentity] = [];
      }
      this.subscriptions[actionIdentity].push(callback);
    }
  }

  /**
   * Publish next action to all the subscribed services
   * 
   * @param {Action} action The action
   * @returns {Observable<ApplicationState>} An observable
   */
  next(action: Action): Observable<ApplicationState> {

    let actionIdentity: any = action.constructor;
    let statelessAction: boolean = (action instanceof StatelessAction);
    let services: any[] = this.subscriptions[actionIdentity];

    console.log('Action: ', action,
      ', Type:', (statelessAction ? 'stateless' : 'stateful'),
      ', Services: ', (services ? services.length : 0) + ' found.');

    if (services === undefined || services.length === 0) {
      return Observable.empty();
    }


    return Observable.create((observer: Observer<ApplicationState>) => {
      let observable: Observable<ApplicationState> = Observable.from(services)
        .flatMap((service: ServiceFunction): any => {
          return service(this.state, action);
        })
        .map((state: ApplicationState) => {
          if (statelessAction) {
            observer.next(state);
            observer.complete();
            return state;
          }

          console.debug('state changed?:', this.state === state, JSON.stringify(this.state) === JSON.stringify(state));
          this.state = state;
          // @if isDev
          console.debug('ApplicationState:', state);
          state = this.makeImmutable(state);
          // @endif
          this.stateObserver.next(state);
          return state;
        })
        .catch((error: any): any => {
          console.error(error);
          observer.error(error);
          observer.complete();
          return Observable.empty();
        })
        .skipWhile((state: ApplicationState, i: number) => i + 1 < services.length)
        .share();

      observable.subscribe(
        (state: ApplicationState) => {
          observer.next(state);
          observer.complete();
        }, (error: any) => {
          observer.error(error);
          observer.complete();
        }, () => observer.complete()
      );
    });
  }

}
