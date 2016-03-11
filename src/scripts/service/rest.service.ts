// import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {Injectable} from 'angular2/core';
import {Http, Request, Response, RequestMethod, RequestOptions, BaseRequestOptions} from 'angular2/http';

export class RestOptions extends BaseRequestOptions {
    constructor() {
        super();
        this.url = '//localhost:9200/pathway/';
        this.headers.append('Content-Type', 'application/json');
    }
}

@Injectable()
export class RestService {

    private requestsInFlight: Object = {};

    constructor(private http: Http, private restOptions: RestOptions) { }

    create(path: string, body: Object): Observable<Response> {
        return this.request(path, RequestMethod.Post, body);
    }

    read(path: string, search?: Object, data?: Object): Observable<Response> {
        if (data) {
            return this.request(path, RequestMethod.Post, data, search);
        }
        return this.request(path, RequestMethod.Get, null, search);
    }

    update(path: string, body: Object): Observable<Response> {
        return this.request(path, RequestMethod.Put, body);
    }

    delete(path: string): Observable<Response> {
        return this.request(path, RequestMethod.Delete);
    }

    private request(path: string, method: RequestMethod, body?: Object, search?: Object): Observable<Response> {
        let options = new RequestOptions(this.restOptions.merge({
            method: method,
            url: this.restOptions.url + path,
            body: JSON.stringify(body),
            search: this.serialize(search)
        }));

        let requestId = JSON.stringify(options, null, 4);
        let request: Observable<Response> = this.requestsInFlight[requestId];
        if (request) {
            // request.dispose();
            return request;
            // return Observable.create((observer: any) => {
            //     request.share().subscribe(
            //         (data: Response) => observer.next(data),
            //         (error: any) => observer.error(error),
            //         () => observer.complete()
            //     );
            // });
        }

        return this.requestsInFlight[requestId] = this.http.request(new Request(options))
            .share()
            // @if isDev
            .delay(Math.random() * 10)
            // @endif
            .retryWhen(this.retryAttempts)
            .finally(() => {
                this.requestsInFlight[requestId] = undefined;
            });
    }

    protected retryAttempts(attempts: any) {
        return Observable.range(1, 3)
            .zip(attempts, (i: number) => i)
            .flatMap((i: number) => {
                console.log('delay retry by ' + i + ' second(s)');
                return Observable.timer(i * 1000);
            });
    };

    private serialize(obj: Object): string {
        var str = [];

        for (let p in obj) {
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            }
        }

        return str.join('&');
    }
}
