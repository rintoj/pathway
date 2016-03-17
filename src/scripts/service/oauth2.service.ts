import {User} from '../state/user';
import {Config} from '../state/config';
import {Dispatcher} from '../state/dispatcher';
import {Injectable} from 'angular2/core';
import {RestService} from './rest.service';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {ApplicationState} from '../state/application-state';
import {LoginAction, LogoutAction, ValidateAuthAction} from '../state/user';
import {Response, RequestMethod, RequestOptions, Headers} from 'angular2/http';

@Injectable()
export class OAuth2Service {

    private url: string = Config.SERVICE_URL + '/oauth';

    constructor(
        private rest: RestService,
        dispatcher: Dispatcher
    ) {
        this.subscribeToDispatcher(dispatcher);
    }

    private subscribeToDispatcher(dispatcher: Dispatcher) {
        dispatcher.subscribe([new LoginAction(null)], this.login.bind(this));
        // dispatcher.subscribe([new LogoutAction()], this.logout.bind(this));
        dispatcher.subscribe([new ValidateAuthAction(null)], this.validateAuth.bind(this));
    }

    protected login(state: ApplicationState, action: LoginAction): Observable<ApplicationState> {

        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Authorization', Config.LOGIN_AUTH_HEADER);

        let options = new RequestOptions({
            method: RequestMethod.Post,
            url: `${this.url}/token`,
            body: this.rest.serialize({
                username: action.user.userId,
                password: action.user.password,
                grant_type: 'password'
            }),
            headers: headers
        });

        return this.rest.request(options)
            .map((response: Response): ApplicationState => this.mapLoginResponse(response, state, action));
    }

    protected mapLoginResponse(response: Response, state: ApplicationState, action: LoginAction): ApplicationState {
        var json = response.json();

        let user: User = {
            id: null,
            name: 'Unknown',
            userId: action.user.userId,
            auth: json
        };

        state.user = user;
        return state;
    }

    protected logout(state: ApplicationState, action: LogoutAction): ApplicationState {
        console.log('logout', state, action);
        return Observable.create();
    }

    protected validateAuth(state: ApplicationState, action: ValidateAuthAction): ApplicationState {
        console.log('validateAuth', state, action);
        return Observable.create((observer: Observer<ApplicationState>) => {

            if (!state.user || !state.user.auth || !state.user.auth.access_token) {
                observer.error({
                    status: 401,
                    message: 'Unauthorized!'
                });
                return observer.complete();
            }

            var headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', 'Bearer ' + state.user.auth.access_token);

            let options = new RequestOptions({
                method: RequestMethod.Get,
                url: `${this.url}/user`,
                body: this.rest.serialize({
                    userId: action.user.userId
                }),
                headers: headers
            });

            let request = this.rest.request(options)
                .map((response: Response): ApplicationState => this.mapUserResponse(response, state, action));

            request.subscribe((data: any) => observer.next(data), (error: any) => observer.error(error), () => observer.complete());
            observer.complete();
        });
    }

    protected mapUserResponse(response: Response, state: ApplicationState, action: ValidateAuthAction): ApplicationState {
        var json = response.json();

        let user: User = {
            id: json._id,
            name: json.name,
            userId: json.userId,
            auth: state.user.auth
        };

        state.user = user;
        return state;
    }


}