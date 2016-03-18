import {User} from '../state/user';
import {Config} from '../state/config';
import {Dispatcher} from '../state/dispatcher';
import {Injectable} from 'angular2/core';
import {RestService} from './rest.service';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {ApplicationState} from '../state/application-state';
import {Response, RequestMethod, RequestOptions, Headers} from 'angular2/http';
import {LoginAction, LogoutAction, ValidateAuthAction, CreateUserAction, VerifyUserAction} from '../state/user';

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
        dispatcher.subscribe([new LogoutAction()], this.logout.bind(this));
        dispatcher.subscribe([new ValidateAuthAction()], this.validateAuth.bind(this));
        dispatcher.subscribe([new CreateUserAction(null)], this.createUser.bind(this));
        dispatcher.subscribe([new VerifyUserAction(null)], this.verifyUser.bind(this));
    }

    protected login(state: ApplicationState, action: LoginAction): Observable<ApplicationState> {

        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Authorization', Config.BASIC_AUTH_HEADER);

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

        return this.rest.request(options).map((response: Response): ApplicationState => this.mapLoginResponse(response, state, action));
    }

    protected mapLoginResponse(response: Response, state: ApplicationState, action: LoginAction): ApplicationState {
        var json = response.json();

        let user: User = {
            id: null,
            name: 'User',
            userId: action.user.userId,
            auth: json
        };

        state.user = user;
        return state;
    }

    protected logout(state: ApplicationState, action: LogoutAction): Observable<ApplicationState> {
        console.log('logout', state, action);
        return Observable.create((observer: Observer<ApplicationState>) => {
            state.user = undefined;
            observer.next(state);
            observer.complete();
        });
    }

    protected validateAuth(state: ApplicationState, action: ValidateAuthAction): Observable<ApplicationState> {

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + (state.user && state.user.auth && state.user.auth.access_token));

        let options = new RequestOptions({
            method: RequestMethod.Get,
            url: `${this.url}/user`,
            body: this.rest.serialize({
                userId: state.user && state.user.userId
            }),
            headers: headers
        });

        return this.rest.request(options)
            .map((response: Response): ApplicationState => this.mapUserResponse(response, state, action));
    }

    protected mapUserResponse(response: Response, state: ApplicationState, action: ValidateAuthAction): ApplicationState {
        var json = response.json()[0];

        let user: User = {
            id: json._id,
            name: json.name,
            userId: json.userId,
            auth: state.user && state.user.auth
        };

        state.user = user;
        return state;
    }

    protected createUser(state: ApplicationState, action: CreateUserAction): Observable<ApplicationState> {
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Authorization', Config.BASIC_AUTH_HEADER);

        let options = new RequestOptions({
            method: RequestMethod.Put,
            url: `${this.url}/user`,
            body: this.rest.serialize(action.user),
            headers: headers
        });

        return this.rest.request(options).map((response: Response): ApplicationState => state);
    }

    protected verifyUser(state: ApplicationState, action: VerifyUserAction): Observable<ApplicationState> {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', Config.BASIC_AUTH_HEADER);

        let options = new RequestOptions({
            method: RequestMethod.Get,
            url: `${this.url}/user?userId=${action.userId}`,
            headers: headers
        });
        // return Observable.create((observer: Observer<ApplicationState>) => {
        //     observer.next(state);
        //     observer.complete();
        // }).share();

        return this.rest.request(options).map((response: Response): ApplicationState => state);
    }
}