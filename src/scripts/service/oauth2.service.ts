import {Config} from '../state/config';
import {Dispatcher} from '../state/dispatcher';
import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import {RestService} from './rest.service';
import {ApplicationState} from '../state/application-state';
import {User, LoginPayload} from '../state/user';
import {LoginAction, LogoutAction} from '../state/user';
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
            .map((response: Response): ApplicationState => this.mapResponse(response, action.user));

        // request.subscribe((data: any) => {
        //     console.log('HJEREEREERER:', data);
        //     return data;
        // }, (data: any) => {
        //     console.error('HJEREEREERER:', data);
        //     return data;
        // });

        // // return request.map((response: Response): ApplicationState => this.mapResponse(response, action.user));
        // return Observable.empty();
    }

    protected logout(state: ApplicationState, action: LogoutAction): ApplicationState {
        console.log('logout', state, action);
        return Observable.create();
    }

    // private fetchProjectlog(state: ApplicationState, action: FetchProjectlogAction): Observable<ApplicationState> {
    //     return this.rest.fetch(`${this.url}/_search`, action.page.currentIndex(), action.page.filters)
    //         .map((response: Response): ApplicationState => this.mapResponse(response, action.page))
    //         .map((s: ApplicationState) => {
    //             if (s.projectlogs.page.currentPage === 0) {
    //                 state.projectlogs.list = s.projectlogs.list;
    //             } else {
    //                 state.projectlogs.list = state.projectlogs.list.concat(s.projectlogs.list);
    //             }
    //             state.projectlogs.page = s.projectlogs.page;
    //             return state;
    //         });
    // }

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

    // fetch(page?: Page<any>, sortAsc: boolean = true): Promise<any> {
    //     var defer = PromiseWrapper.completer();

    //     this.rest.read(`${this.url}/_search`, (page === undefined) ? undefined : page.currentIndex(), {
    //         'sort': {
    //             'index': {
    //                 'order': sortAsc ? 'asc' : 'desc'
    //             }
    //         }
    //     })
    //         .map((response: Response) => this.mapResponse(response, page))
    //         .subscribe(

    //         (data: Page<Projectlog[]>) => {
    //             if (page !== undefined) {
    //                 this.data = this.data.concat(data.data);
    //             } else {
    //                 this.data = data.data;
    //             }
    //             this.publish(data.data); 
    //             defer.resolve(data);
    //         },

    //         defer.reject);

    //     return defer.promise;
    // }

    // update(projectlog: Projectlog): Promise<any> {
    //     var defer = PromiseWrapper.completer();
    //     this.rest.update(`${this.url}/${projectlog.id}`, projectlog)
    //         .subscribe(defer.resolve, defer.reject);
    //     return defer.promise;
    // }

    // create(projectlog: Projectlog): ProjectlogService {
    //   this.data.unshift(projectlog);
    //   this.rest.create(this.url, projectlog).map((res: Response) => res.json()).subscribe(this.publish);
    //   return this;
    // }

    // update(projectlog: Projectlog): void {
    //   this.rest.update(`${this.url}/${projectlog.id}`, projectlog)
    //     .subscribe(() => console.log('updated!'));
    // }

    // delete(projectlog: Projectlog): ProjectlogService {
    //   this.data.splice(this.data.indexOf(projectlog), 1);
    //   this.rest.delete(`${this.url}/${projectlog.id}`).map((res: Response) => res.json())
    //     .subscribe(this.publish);
    //   return this;
    // }
}