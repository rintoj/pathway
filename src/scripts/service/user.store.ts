import {User} from '../state/user';
import {Dispatcher} from '../state/dispatcher';
import {Inject, Injectable} from 'angular2/core';
import {RestService} from './rest.service';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {ApplicationState} from '../state/application-state';
import {AuthInfo, RestServiceWithOAuth2} from '../util/oauth2-rest.service';
import {Response, RequestMethod, RequestOptions, Headers} from 'angular2/http';
import {LoginAction, LogoutAction, ValidateUserAction, CreateUserAction, VerifyUserAction} from '../state/action';

@Injectable()
export class UserStore {

  private url: string = '/oauth2';

  constructor(
    private rest: RestService,
    @Inject('DataService') private dataService: RestServiceWithOAuth2,
    dispatcher: Dispatcher
  ) {
    this.subscribeToDispatcher(dispatcher);
  }

  private subscribeToDispatcher(dispatcher: Dispatcher) {
    dispatcher.subscribe([new LoginAction(null)], this.login.bind(this));
    dispatcher.subscribe([new LogoutAction()], this.logout.bind(this));
    dispatcher.subscribe([new ValidateUserAction()], this.validateUser.bind(this));
    dispatcher.subscribe([new CreateUserAction(null)], this.createUser.bind(this));
    dispatcher.subscribe([new VerifyUserAction(null)], this.verifyUser.bind(this));
  }

  protected login(state: ApplicationState, action: LoginAction): Observable<ApplicationState> {
    return this.dataService
      .authorize(action.user.userId, action.user.password)
      .map((auth: AuthInfo) => {
        state.user = {
          id: null,
          name: 'User',
          userId: action.user.userId,
          auth: auth
        };
        return state;
      });
  }

  protected logout(state: ApplicationState, action: LogoutAction): Observable<ApplicationState> {
    return this.dataService
      .revokeAuthorization()
      .map((response: Response) => {
        state.user = null;
        return state;
      });
  }

  protected validateUser(state: ApplicationState, action: ValidateUserAction): Observable<ApplicationState> {

    if (!state.user) {
      return Observable.create((observer: Observer<ApplicationState>) => {
        observer.error('No user');
        observer.complete();
      }).share();
    }

    return this.dataService.get(`${this.url}/user`)
      .map((response: Response): ApplicationState => {
        var json = response.json()[0];

        let user: User = {
          id: json._id,
          name: json.name,
          userId: json.userId,
          auth: state.user && state.user.auth
        };

        state.user = user;
        return state;
      });
  }

  protected createUser(state: ApplicationState, action: CreateUserAction): Observable<ApplicationState> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    // headers.append('Authorization', Config.BASIC_AUTH_HEADER);

    let options = new RequestOptions({
      method: RequestMethod.Put,
      url: `${this.url}/register`,
      body: this.rest.serialize(action.user),
      headers: headers
    });

    return this.rest.request(options).map((response: Response): ApplicationState => state).share();
  }

  protected verifyUser(state: ApplicationState, action: VerifyUserAction): Observable<ApplicationState> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    // headers.append('Authorization', Config.BASIC_AUTH_HEADER);

    let options = new RequestOptions({
      method: RequestMethod.Get,
      url: `${this.url}/user?userId=${action.userId}`,
      headers: headers
    });

    return this.rest.request(options).map((response: Response): ApplicationState => state);
  }
}