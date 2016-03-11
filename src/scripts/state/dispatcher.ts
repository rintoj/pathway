import {Subject} from 'rxjs/Subject';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
// import {Promise} from 'angular2/src/facade/async';
import {BehaviorSubject} from 'rxjs/Rx';
import {ApplicationState, ApplicationStateObservable} from './application-state';

/**
 * Defines a function that can perform an action
 * 
 * @export
 * @interface ServiceFunction
 */
export interface ServiceFunction {
    (state: ApplicationState, action: Action): Observable<any>;
}

/**
 * Defines an action
 * 
 * @export
 * @class Action
 */
export abstract class Action { }

export class Dispatcher {

    private actions: Subject<Action> = new Subject<Action>();
    private subscriptions: any = {};
    private state: ApplicationStateObservable;

    constructor(initialState: ApplicationState) {
        this.state = this.createState(initialState);
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
		return Observable.create((observer: Observer<any>) => {
			let subscription: Subscription<any> = this.actions.subscribe(
				(value: any) => {
					subscription.unsubscribe();
					observer.next(value);
				},
				(value: any) => {
					subscription.unsubscribe();
					observer.error(value);
				},
				() => {
					subscription.unsubscribe();
					observer.complete();
				});
			this.actions.next(action);

			return () => subscription.unsubscribe;
		});
    }

	private createState(initialState: ApplicationState): ApplicationStateObservable {

        let observableState = this.actions.scan((state: ApplicationState, action: Action) => {

            console.log('Processing action: ', action);

            let nextState: ApplicationState = state;
            let actionIdentity: any = action.constructor;
            let actions: ServiceFunction[] = this.subscriptions[actionIdentity];

            // if there are any registered actions
            if (actions && actions.length > 0) {
				let subscription: Subscription<any> = Observable.from(actions)
					.flatMap((service: ServiceFunction) => service(nextState, action))
					.finally(() => subscription.unsubscribe())
					.subscribe((data: any) => console.log(data));
            }

            return nextState;
        }, initialState).share();

        // initial state is being wrapped into BehaviourSubject;
        const response = new BehaviorSubject(initialState);
        observableState.subscribe((s: ApplicationState) => response.next(s));
        return response;
    };

    static stateFactory(dispatcher: Dispatcher): ApplicationStateObservable {
        return dispatcher.state;
    }
}
