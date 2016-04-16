
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {Inject, Injectable} from 'angular2/core';
import {BaseRestService, RestServiceOptions} from './rest.service';
import {Http, Headers, Response, RequestMethod, RequestOptions, BaseRequestOptions} from 'angular2/http';

export interface Token {
  token: string;
  expiresIn?: number;
}

export interface RestServiceWithOAuth2Options extends RestServiceOptions {
  authUrl: string;
  clientId: string;
  clientSecret: String;
  accessToken: Token;
  refreshToken: Token;
}

@Injectable()
export class RestServiceWithOAuth2 extends BaseRestService {

  constructor(protected http: Http, @Inject('DataServiceOptions') protected options: RestServiceWithOAuth2Options) {
    super(http, new BaseRequestOptions(), options.baseUrl, options.cacheRequest);
  }

  authorize(userName: string, password: string): Observable<boolean> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Authorization', 'Base ' + btoa(`${this.options.clientId}:${this.options.clientSecret}`));

    let options = new RequestOptions({
      method: RequestMethod.Post,
      url: this.options.authUrl || `${this.options.baseUrl}/token`,
      headers: headers,
      body: this.serialize({
        username: userName,
        password: password,
        grant_type: 'password'
      })
    });

    return Observable.create((observer: Observer<boolean>) => {
      this.httpRequest(options).map((response: Response) => response.json())
        .subscribe((data: any) => {
          this.options.accessToken.token = data.access_token;
          this.options.accessToken.expiresIn = data.expires_in;
          this.options.refreshToken.token = data.refresh_token;
        });
    });
  }
}
