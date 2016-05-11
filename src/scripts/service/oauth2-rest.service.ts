
import {Observer} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import {Inject, Injectable} from '@angular/core';
import {BaseRestService, RestServiceOptions} from './rest.service';
import {Http, Headers, Response, RequestMethod, RequestOptions, BaseRequestOptions} from '@angular/http';

export interface Token {
  token: string;
  expiresIn?: number;
}

export interface RestServiceWithOAuth2Options extends RestServiceOptions {
  authUrl?: string;
  revokeAuthUrl?: string;
  clientId: string;
  clientSecret: String;
  accessToken: Token;
  refreshToken: Token;
}

export interface AuthInfo {
  accessToken: Token;
  refreshToken: Token;
}

@Injectable()
export class RestServiceWithOAuth2 extends BaseRestService {

  constructor(protected http: Http, @Inject('RestServiceOptions') protected options: RestServiceWithOAuth2Options) {
    super(http, new BaseRequestOptions(), options.baseUrl, options.cacheRequest);

    if (!options.cacheRequest) {
      this.requestOptions.headers.append('Cache-Control', 'no-cache');
    }
    this.requestOptions.headers.append('Content-Type', options.contentType || 'application/json');
  }

  authenticate(userName: string, password: string): Observable<AuthInfo> {
    var headers: Headers = new Headers();
    headers.append('Cache-Control', 'no-cache');
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Authorization', 'Basic ' + btoa(`${this.options.clientId}:${this.options.clientSecret}`));

    let options: RequestOptions = new RequestOptions({
      method: RequestMethod.Post,
      url: this.options.authUrl || `${this.options.baseUrl}/oauth2/token`,
      body: this.serialize({
        username: userName,
        password: password,
        grant_type: 'password'
      }),
      headers: headers
    });

    return Observable.create((observer: Observer<AuthInfo>) => {
      this.httpRequest(options).map((response: Response, index: number): any => response.json())
        .subscribe((data: any) => {
          this.options.accessToken = {
            token: data.access_token,
            expiresIn: data.expires_in
          };
          this.options.refreshToken = {
            token: data.refresh_token
          };
          observer.next({
            accessToken: this.options.accessToken,
            refreshToken: this.options.refreshToken
          });
          observer.complete();
        }, (error: any) => {
          observer.error(error);
          observer.complete();
        });
    }).share();
  }

  revokeAuthentication(): Observable<any> {
    var headers: Headers = new Headers();
    headers.append('Cache-Control', 'no-cache');
    headers.append('Content-Type', 'application/json');
    let options: RequestOptions = new RequestOptions({
      method: RequestMethod.Post,
      url: this.options.revokeAuthUrl || `${this.options.baseUrl}/oauth2/revoke`,
      headers: headers
    });

    return Observable.create((observer: Observer<AuthInfo>) => {
      this.httpRequestWithAuth(options)
        .map((response: Response) => {
          this.options.accessToken = null;
          this.options.refreshToken = null;
          return response.json();
        }).subscribe(() => {
          observer.next(null);
          observer.complete();
        }, () => {
          observer.next(null);
          observer.complete();
        }, () => {
          observer.complete();
        });
    }).share();
  }

  request(url: string, method: RequestMethod, body?: Object, search?: Object): Observable<Response> {
    return this.httpRequestWithAuth(new RequestOptions(this.requestOptions.merge({
      url: this.baseUrl + url,
      body: JSON.stringify(body),
      search: this.serialize(search),
      method: method
    })));
  }

  requestWithBasicAuth(url: string, method: RequestMethod, body?: Object, search?: Object): Observable<Response> {
    return this.httpRequestWithBasicAuth(new RequestOptions(this.requestOptions.merge({
      url: this.baseUrl + url,
      body: JSON.stringify(body),
      search: this.serialize(search),
      method: method
    })));
  }

  httpRequestWithBasicAuth(options: RequestOptions): Observable<Response> {
    if (this.options.clientId && this.options.clientSecret) {
      // options.headers.set('Content-Type', 'application/x-www-form-urlencoded');
      options.headers.set('Authorization', 'Basic ' + btoa(`${this.options.clientId}:${this.options.clientSecret}`));
    }
    return this.httpRequest(options);
  }

  httpRequestWithAuth(options: RequestOptions): Observable<Response> {
    if (this.options.accessToken && this.options.accessToken.token) {
      options.headers.set('Authorization', 'Bearer ' + this.options.accessToken.token);
    }
    return this.httpRequest(options);
  }
}
