// import {Subject} from 'rxjs/Subject';
import {Immutable}  from './immutable';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
// import {Subscription} from 'rxjs/Subscription';
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

export class Dispatcher {

    // private actions: Subject<Action> = new Subject<Action>();
	private state: ApplicationState;
    private subscriptions: any = {};
	private stateObserver: Observer<ApplicationState>;
    private stateObservable: ApplicationStateObservable;

    constructor(initialState: ApplicationState) {

		// set initial state
        this.state = initialState;

		// create state observable
		this.stateObservable = this.wrapIntoBehaviourSubject(
			this.state,
			ApplicationStateObservable.create((observer: Observer<ApplicationState>) => this.stateObserver = observer).share()
		);
    }

	/**
	 * Wrap application state observable into BehaviourSubject so that the initial value at each .subscribe() will be returned.
	 *
	 * @private
	 * @param {ApplicationState} intialState (description)
	 * @param {ApplicationStateObservable} observableState (description)
	 * @returns {ApplicationStateObservable} (description)
	 */
	private wrapIntoBehaviourSubject(intialState: ApplicationState, observableState: ApplicationStateObservable): ApplicationStateObservable {
		let wrappedSubject: BehaviorSubject<ApplicationState> = new BehaviorSubject<ApplicationState>(this.state);
		observableState.subscribe((s: ApplicationState) => wrappedSubject.next(s));
		return wrappedSubject;
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

    // next1(action: Action): Observable<any> {
	// 	return Observable.create((observer: Observer<any>) => {
	// 		let subscription: Subscription<any> = this.actions.subscribe(
	// 			(value: any) => {
	// 				subscription.unsubscribe();
	// 				observer.next(value);
	// 			},
	// 			(value: any) => {
	// 				subscription.unsubscribe();
	// 				observer.error(value);
	// 			},
	// 			() => {
	// 				subscription.unsubscribe();
	// 				observer.complete();
	// 			});
	// 		this.actions.next(action);

	// 		return () => subscription.unsubscribe;
	// 	});
    // }

	next(action: Action): Observable<any> {
		//   let nextState: Immutable = Immutable.fromJS(state);
		let actionIdentity: any = action.constructor;
		let actions: ServiceFunction[] = this.subscriptions[actionIdentity];

		let observable: any = Observable.from<ServiceFunction>(actions)
			.flatMap((service: ServiceFunction) => service(this.state, action));
		observable.subscribe(
			(state: ApplicationState) => this.stateObserver.next(this.mergeAppState(state)),
			(error: any) => this.stateObserver.error(error)
		);
		return observable;
	}

	private mergeAppState(state: ApplicationState): ApplicationState {
		let merger = (previous: any, next: any) => {
			if (Immutable.List.isList(previous) && Immutable.List.isList(next)) {
				return previous.concat(next);
			} else if (previous && previous.mergeWith) {
				return previous.mergeWith(merger, next);
			}
			return next;
		};

		return this.state = Immutable.fromJS(this.state).mergeWith(merger, Immutable.fromJS(state)).toJS();
	}



	// private createState(initialState: ApplicationState): ApplicationStateObservable {

    //     let observableState = this.actions.scan((state: ApplicationState, action: Action) => {

    //         console.log('Processing action: ', action);

    //         let nextState: Immutable = Immutable.fromJS(state);
    //         let actionIdentity: any = action.constructor;
    //         let actions: ServiceFunction[] = this.subscriptions[actionIdentity];

	// 		return Observable.from(actions)
	// 			.flatMap((service: ServiceFunction) => service(nextState, action))
	// 			.map((data: any) => {
	// 				let map: Immutable = Immutable.fromJS(data);
	// 				console.log(map.toJS());
	// 			});
    //     }, initialState).share();

    //     // initial state is being wrapped into BehaviourSubject;
    //     const response = new BehaviorSubject(initialState);
    //     observableState.subscribe((s: ApplicationState) => response.next(s));
    //     return response;
    // };

    static stateFactory(dispatcher: Dispatcher): ApplicationStateObservable {
        return dispatcher.stateObservable;
    }
}
