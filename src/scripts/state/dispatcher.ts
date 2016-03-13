import {Observer} from 'rxjs/Observer';
import {Immutable}  from './immutable';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/Rx';
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
 * Defines an action
 *
 * @export
 * @class Action
 */
export abstract class Action { }

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

    static stateFactory(dispatcher: Dispatcher): ApplicationStateObservable {
        return dispatcher.stateObservable;
    }

    constructor(initialState: ApplicationState) {

        // set initial state
        this.state = initialState;

        // create state observable
        this.stateObservable = this.wrapIntoBehaviourSubject(
            this.makeImmutable(this.state),
            ApplicationStateObservable.create((observer: Observer<ApplicationState>) => this.stateObserver = observer).share()
        );
    }

    protected makeImmutable(object: Object) {
        return Immutable.fromJS(object, (key: any, value: any) => {
            console.log(Immutable.Iterable.isIndexed(value), value);

            if (Immutable.Iterable.isIndexed(value)) {
                return value.toList();
            }

            // convert every object into a record
            value = value.toObject();
            let ImmutableObject = Immutable.Record(value);
            return new ImmutableObject(value);
        });
    }

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

    subscribe(actions: Action[], callback: ServiceFunction) {
        for (let action of actions) {
            let actionIdentity: any = action.constructor;
            if (!this.subscriptions[actionIdentity]) {
                this.subscriptions[actionIdentity] = [];
            }
            this.subscriptions[actionIdentity].push(callback);
        }
    }

    next(action: Action): Observable<any> {
        let actionIdentity: any = action.constructor;
        let actions: ServiceFunction[] = this.subscriptions[actionIdentity];

        let observable: Observable<any> = Observable.from<ServiceFunction>(actions)
            .flatMap((service: ServiceFunction) => service(this.state, action));

        observable.subscribe(
            (state: ApplicationState) => {
                this.state = state;
                this.stateObserver.next(this.makeImmutable(state));
            },
            (error: any) => this.stateObserver.error(error)
        );
        return observable;
    }

}
