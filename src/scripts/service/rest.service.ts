import {Config} from '../state/config';
import {Observable} from 'rxjs/Observable';
import {Injectable} from 'angular2/core';
import {Http, Request, Response, RequestMethod, RequestOptions, BaseRequestOptions} from 'angular2/http';

export class RestOptions extends BaseRequestOptions {
    constructor() {
        super();
        this.headers.append('Content-Type', 'application/json');
    }
}

@Injectable()
export class RestService {

    // private requestsInFlight: Object = {};

    constructor(private http: Http, private restOptions: RestOptions) { }

    query(path: string, body: Object): Observable<Response> {
        return this.makeRequest(path, RequestMethod.Post, body);
    }

    fetch(path: string, search?: Object, body?: Object): Observable<Response> {
        if (body) {
            return this.makeRequest(path, RequestMethod.Post, body, search);
        }
        return this.makeRequest(path, RequestMethod.Get, null, search);
    }

    createOrUpdate(path: string, body: Object): Observable<Response> {
        return this.makeRequest(path, RequestMethod.Put, body);
    }

    delete(path: string): Observable<Response> {
        return this.makeRequest(path, RequestMethod.Delete);
    }

    get defaultOptions() {
        return this.restOptions;
    }

    request(options: RequestOptions, force: boolean = false) {

        // let requestId = JSON.stringify(options, null, 4);
        // let request: Observable<Response> = this.requestsInFlight[requestId];

        // if (request) {
        //     // if a request is in flight ignore this request and return the previous observable
        //     if (!force) {
        //         return request;
        //     }
        // }

        return this.http.request(new Request(options));

        // return this.requestsInFlight[requestId] = this.http.request(new Request(options));
        // .share()
        // @if isDev
        // .delay(Config.SERVICE_ACCESS_DELAY)
        // @endif
        // @if isProd
        // .retryWhen(this.retryAttempts)
        // @endif
        // .finally(() => {
        //     this.requestsInFlight[requestId] = undefined;
        // });
    }

    serialize(obj: Object): string {
        var str = [];

        for (let p in obj) {
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            }
        }

        return str.join('&');
    }

    protected makeRequest(path: string,
        method: RequestMethod,
        body?: Object,
        search?: Object,
        force: boolean = false
    ): Observable<Response> {
        let options = new RequestOptions(this.restOptions.merge({
            method: method,
            url: path,
            body: JSON.stringify(body),
            search: this.serialize(search)
        }));

        return this.request(options, force);
    }

    protected retryAttempts(attempts: any) {
        return Observable.range(1, Config.SERVICE_RETRY_COUNT)
            .zip(attempts, (i: number) => i)
            .flatMap((i: number) => {
                console.log('Attempt ' + i + ' of ' + Config.SERVICE_RETRY_COUNT + ' within ' +
                    Config.SERVICE_RETRY_DELAY + ' milli-second(s)');
                return Observable.timer(Config.SERVICE_RETRY_DELAY);
            });
    };


}
