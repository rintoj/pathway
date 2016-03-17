import {Config} from '../state/config';
import {Observer} from 'rxjs/Observer';
import {Response} from 'angular2/http';
import {Dispatcher} from '../state/dispatcher';
import {Observable} from 'rxjs/Observable';
import {RestService} from './rest.service';
import {Injectable, Inject} from 'angular2/core';
import {ApplicationStatus} from '../state/ui-state';
import {User, LoginPayload} from '../state/user';
import {ApplicationState, ApplicationStateObservable, RestoreAppStateAction} from '../state/application-state';

export interface DataServiceOptions {
    offline: boolean;
};

@Injectable()
export class DataService {

    constructor(
        dispatcher: Dispatcher,
        private rest: RestService,
        private stateObservable: ApplicationStateObservable,
        @Inject('DataServiceOptions') private options: DataServiceOptions
    ) {
        this.subscribeToDispatcher(dispatcher);
        if (this.options.offline) {
            this.stateObservable.subscribe(this.saveApplicationState.bind(this));
        }
    }

    private subscribeToDispatcher(dispatcher: Dispatcher) {
        if (this.options.offline) {
            dispatcher.subscribe([new RestoreAppStateAction()], this.restoreAppState.bind(this));
        }
    }

    protected saveApplicationState(immutableState: any) {
        let state: ApplicationState = immutableState.toJS ? immutableState.toJS() : immutableState;
        console.log(immutableState);
        if (immutableState.ui.applicationStatus === ApplicationStatus.STARTED && immutableState.ui.restorePending === false) {
            console.log('Saving application state', state);
            let applicationId = btoa(Config.APPLICATION_NAME);
            localStorage.setItem(applicationId, btoa(JSON.stringify(state)));
        }
    }

    protected restoreAppState(currentState: ApplicationState, action: RestoreAppStateAction): Observable<ApplicationState> {
        return Observable.create((observer: Observer<ApplicationState>) => {
            let applicationId = btoa(Config.APPLICATION_NAME);
            let applicationState = localStorage.getItem(applicationId);

            if (applicationState) {
                let state: ApplicationState = JSON.parse(atob(applicationState));
                state.ui.restorePending = false;
                console.log('Application State restored', state);
                observer.next(state);
            } else {
                currentState.ui.restorePending = false;
                observer.next(currentState);
            }
            observer.complete();
        });
    }

    protected mapResponse(response: Response, payload: LoginPayload): ApplicationState {
        var json = response.json();

        let user: User = {
            id: null,
            name: 'Unknown',
            userId: payload.userId,
            auth: json
        };

        return { user: user };
    }
}