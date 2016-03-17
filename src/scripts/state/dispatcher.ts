import {Observer} from 'rxjs/Observer';
import {Immutable}  from './immutable';
import {Observable} from 'rxjs/Observable';
// import {ObservableUtil} from '../util/ObservableUtil';
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
    // private actionObserver: Observer<ServiceAction[]>;
    // private actionObservable: Observable<ServiceAction[]>;
    private subscriptions: any = {};
    private stateObserver: Observer<ApplicationState>;
    private stateObservable: ApplicationStateObservable;

    private s: number = 1;

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

        // create action observable
        // this.actionObservable = Observable.create((observer: Observer<ServiceAction[]>) => this.actionObserver = observer)
        //     .flatMap((serviceActions: ServiceAction[]): any => serviceActions)
        //     .flatMap((serviceAction: ServiceAction) => {
        // 		console.log('Processing action: ', serviceAction);
        //         return serviceAction.service(this.state, serviceAction.action);
        //     })
        //     .map((state: ApplicationState) => {
        //         this.state = state;
        //         // @if isDev
        //         state = this.makeImmutable(state);
        //         // @endif
        //         this.stateObserver.next(state);
        //         return state;
        //     })
        //     .share();

        // // subscribe to active actionObservable once
        // this.actionObservable.subscribe();
    }

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
        // let actionIdentity: any = action.constructor;
        // let services: any[] = this.subscriptions[actionIdentity];

        let processor = (v: any) => {
            console.log('processor:', v);
            return Observable.create((observer: any) => observer.next(v + 1));
        };

        let x: any[] = [];
        x.push(processor);
        x.push(processor);
        x.push(processor);
        x.push(processor);

        console.log('Processing action: ', action, x.length + ' service(s) found.');


        Observable.from(x)
            .flatMap((x: any): any => {
                console.log('flat map:', this.s);
                return x(this.s);
            })
            .map((v: any) => {
                this.s = v;
                console.log('map:', this.s);
                return v;
            })
            .skipWhile(function(v: any, i: number) { return i + 1 < x.length; })
            .subscribe((v: any) => console.log('next: ', v, this.s));


        let actionIdentity: any = action.constructor;
        let services: any[] = this.subscriptions[actionIdentity];

        console.log('Processing action: ', action, services.length + ' service(s) found.');
        if (services === undefined || services.length === 0) {
            return Observable.empty();
        }
        return Observable.create((observer: Observer<ApplicationState>) => {
            let observable: Observable<ApplicationState> = Observable.from(services)
                .flatMap((service: ServiceFunction): any => {
                    return service(this.state, action);
                })
                .map((state: ApplicationState) => {
                    this.state = state;
                    // @if isDev
                    state = this.makeImmutable(state);
                    // @endif
                    this.stateObserver.next(state);
                    return state;
                })
                .catch((error: any): any => {
                    observer.error(error);
                    observer.complete();
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
