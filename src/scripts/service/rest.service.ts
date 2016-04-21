import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import { Injectable} from 'angular2/core';
import {Http, Request, Response, RequestMethod, RequestOptions} from 'angular2/http';

export interface RestService {
  get(url: string, search?: Object): Observable<Response>;
  post(url: string, body: Object, search?: Object): Observable<Response>;
  put(url: string, body: Object, search?: Object): Observable<Response>;
  delete(url: string, body?: Object, search?: Object): Observable<Response>;
  request(url: string, method: RequestMethod, body?: Object, search?: Object): Observable<Response>;
}

export interface RestServiceOptions {
  baseUrl: string;
  contentType: string;
  cacheRequest: boolean;
}

@Injectable()
export class BaseRestService implements RestService {

  private requestsInFlight: Object = {};

  constructor(
    protected http: Http,
    protected requestOptions: RequestOptions,
    protected baseUrl: string = '',
    protected cacheRequest: boolean = true
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
    return this.httpRequest(new RequestOptions(this.requestOptions.merge({
      url: this.baseUrl + url,
      body: JSON.stringify(body),
      search: this.serialize(search),
      method: method
    })));
  }

httpRequest(options: RequestOptions): Observable<Response> {

    let requestId: string = JSON.stringify(options);
    let request: Observable<Response> = this.requestsInFlight[requestId];

    // if a request is in flight ignore this request and return the previous observable
    if (request && this.cacheRequest) {
      return request;
    }

    return Observable.create((observer: Observer<any>) => {
      this.requestsInFlight[requestId] = this.http.request(new Request(options))
        .share()
        .catch((response: Response) => this.processError(response, observer))
        .finally(() => this.requestsInFlight[requestId] = undefined);

      this.requestsInFlight[requestId].subscribe(
        (data: any) => observer.next(data),
        (error: any) => observer.error(error),
        () => observer.complete()
      );
    });
  }

  protected serialize(object: Object): string {
    var serializedString: string[] = [];
    for (let property in object) {
      if (object.hasOwnProperty(property)) {
        serializedString.push(encodeURIComponent(property) + '=' + encodeURIComponent(object[property]));
      }
    }

    return serializedString.join('&');
  }

  protected processError(response: Response, observer: Observer<any>): Observable<any> {
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

