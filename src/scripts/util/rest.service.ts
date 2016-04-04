import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {Injectable} from 'angular2/core';
import {Http, Request, Response, RequestMethod, RequestOptions, BaseRequestOptions} from 'angular2/http';

export interface Token {
  token: string;
  expiresIn?: number;
  issuedOn?: Date;
}

export interface RestServiceOptions {
  baseUrl: string;
  contentType: string;
  cacheRequest: boolean;
  accessToken?: Token;
  refreshToken?: Token;
  clientId?: string;
  clientSecret?: string;
}

// export class RestRequestOptions extends BaseRequestOptions {

//   constructor(public baseUrl: string = '', public cacheRequest: boolean = true) {
//     super();
//     this.headers.append('Content-Type', 'application/json');
//   }

//   get contentType() {
//     return this.headers.get('Content-Type');
//   }

//   set contentType(contentType: string) {
//     this.setHeader('Content-Type', contentType);
//   }

//   private setHeader(type: string, value: string) {
//     if (value === undefined) {
//       this.headers.delete(type);
//     } else {
//       this.headers.set(type, value);
//     }
//   }
// }

class Service {

  private requestsInFlight: Object = {};

  constructor(
    private http: Http,
    private options: RequestOptions,
    private baseUrl: string = '',
    private cacheRequest: boolean = true
  ) { }

  get(url: string, search?: Object): Observable<Response> {
    return this.request(url, RequestMethod.Get, null, search);
  }

  post(url: string, body: Object, search?: Object): Observable<Response> {
    return this.request(url, RequestMethod.Post, body, search);
  }

  put(url: string, body: Object, search?: Object): Observable<Response> {
    return this.request(url, RequestMethod.Put, body, search);
  }

  delete(url: string, body?: Object, search?: Object): Observable<Response> {
    return this.request(url, RequestMethod.Delete, body, search);
  }

  request(url: string, method: RequestMethod, body?: Object, search?: Object): Observable<Response> {
    return this.sendRequest(new RequestOptions(this.options.merge({
      url: this.baseUrl + url,
      body: JSON.stringify(body),
      search: this.serialize(search),
      method: method
    })));
  }

  sendRequest(options: RequestOptions) {

    let requestId = JSON.stringify(options, null, 4);
    let request: Observable<Response> = this.requestsInFlight[requestId];

    // if a request is in flight ignore this request and return the previous observable
    if (request && this.cacheRequest) {
      return request;
    }

    return Observable.create((observer: Observer<any>) => {
      this.requestsInFlight[requestId] = this.http.request(new Request(options))
        .share()
        .catch((response: Response) => this.processError(response, observer))
        .finally(() => this.requestsInFlight[requestId] = undefined)
        .subscribe((data: any) => observer.next(data), (error: any) => observer.error(error), () => observer.complete);
    });
  }

  protected serialize(object: Object): string {
    var serializedString = [];
    for (let property in object) {
      if (object.hasOwnProperty(property)) {
        serializedString.push(encodeURIComponent(property) + '=' + encodeURIComponent(object[property]));
      }
    }

    return serializedString.join('&');
  }

  protected processError(response: Response, observer: Observer<any>) {
    try {
      switch (response.status) {

        case 400: // Bad request
          throw 'Bad Request';

        case 401: // Unauthorized
          throw 'User is unauthorized!';

        case 403: // Forbidden
          throw 'User is forbidden from accessing this resource!';

        default:
          throw 'Unknown error occured! [' + response.status + ']';
      }
    } catch (error) {
      observer.error({
        status: response.status,
        message: error,
        response: response.json()
      });
      observer.complete();
    }
    return Observable.empty();
  }

  // protected retry(attempts: any) {
  //   return Observable.range(1, Config.SERVICE_RETRY_COUNT)
  //     .zip(attempts, (i: number) => i)
  //     .flatMap((i: number) => {
  //       console.log('Attempt ' + i + ' of ' + Config.SERVICE_RETRY_COUNT + ' within ' +
  //         Config.SERVICE_RETRY_DELAY + ' milli-second(s)');
  //       return Observable.timer(Config.SERVICE_RETRY_DELAY);
  //     });
  // }
}

export enum AuthType {
  ACCESS_TOKEN, REFRESH_TOKEN, CLIENT
}

@Injectable()
export class RestService {

  constructor(private options: RestServiceOptions) { }

  auth(authType: AuthType) {
    var requestOptions = new BaseRequestOptions();

    // set content type; default is 'application/json'
    requestOptions.headers.set('Content-Type', this.options.contentType || 'application/json');

    switch (authType) {
      case AuthType.ACCESS_TOKEN:
        requestOptions.headers.set('Authorization', this.options.accessToken.token);
        break;
    }
  }
}
