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

import {Role} from '../state/user';
import {Observer} from 'rxjs/Observer';
import {Dispatcher} from '../state/dispatcher';
import {Observable} from 'rxjs/Observable';
import {ApplicationState} from '../state/application-state';
import {Inject, Injectable} from 'angular2/core';
import {Response, RequestMethod} from 'angular2/http';
import {AuthInfo, RestServiceWithOAuth2} from '../service/oauth2-rest.service';
import {LoginAction, LogoutAction, ValidateUserAction, CreateUserAction, CheckUserAction, AuthorizeAction} from '../state/action';

@Injectable()
export class UserStore {

  private url: string = '/oauth2';

  constructor(@Inject('DataService') private dataService: RestServiceWithOAuth2, dispatcher: Dispatcher) {
    this.subscribeToDispatcher(dispatcher);
  }

  private subscribeToDispatcher(dispatcher: Dispatcher): void {
    dispatcher.subscribe([new LoginAction(null)], this.login.bind(this));
    dispatcher.subscribe([new LogoutAction()], this.logout.bind(this));
    dispatcher.subscribe([new ValidateUserAction()], this.validateUser.bind(this));
    dispatcher.subscribe([new CreateUserAction(null)], this.createUser.bind(this));
    dispatcher.subscribe([new CheckUserAction(null)], this.checkUser.bind(this));
    dispatcher.subscribe([new AuthorizeAction(null)], this.authorize.bind(this));
  }

  protected login(state: ApplicationState, action: LoginAction): Observable<ApplicationState> {
    return this.dataService
      .authenticate(action.user.userId, action.user.password)
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
      .revokeAuthentication()
      .map((response: Response) => {
        state.user = undefined;
        return state;
      });
  }

  protected authorize(state: ApplicationState, action: AuthorizeAction): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      observer.next(state.user && state.user.roles &&
        state.user.roles.filter((value: Role) => action.roles.indexOf(value) >= 0).length > 0);
      observer.complete();
    }).share();
  }

  protected validateUser(state: ApplicationState, action: ValidateUserAction): Observable<ApplicationState> {

    if (!state.user) {
      return Observable.create((observer: Observer<ApplicationState>) => {
        observer.error('No user');
        observer.complete();
      }).share();
    }

    return this.dataService.requestWithBasicAuth(`${this.url}/user`, RequestMethod.Get, null, { userId: state.user.userId })
      .map((response: Response): ApplicationState => {
        var json: any = response.json()[0];
        state.user = {
          id: json._id,
          name: json.name,
          roles: json.roles.map((value: string) => <Role>Role[value.toUpperCase()]),
          userId: json.userId,
          auth: state.user && state.user.auth
        };
        return state;
      });
  }

  protected createUser(state: ApplicationState, action: CreateUserAction): Observable<ApplicationState> {
    return this.dataService.put(`${this.url}/register`, action.user)
      .map((response: Response): ApplicationState => {
        return state;
      });
  }

  protected checkUser(state: ApplicationState, action: CheckUserAction): Observable<any> {
    return this.dataService.requestWithBasicAuth(`${this.url}/user`, RequestMethod.Get, null, { userId: action.userId })
      .map((response: Response): any => response.json());
  }
}