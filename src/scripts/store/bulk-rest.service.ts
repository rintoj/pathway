import 'rxjs/add/operator/map';

import {Observable} from 'rxjs';
import {Injectable} from 'angular2/core';
import {Promise, PromiseWrapper} from 'angular2/src/facade/promise';
import {Http, Request, Response, RequestMethod, RequestOptions, BaseRequestOptions} from 'angular2/http';

export class BulkRestOptions extends BaseRequestOptions {
  constructor() {
    super();
    this.headers.append('Content-Type', 'application/json');
  }
}

@Injectable()
export class BulkRestService {

  private restOptions: BulkRestOptions = new BulkRestOptions();

  constructor(private http: Http) { }

  uploadSampleData(dataUrl: string, uploadUrl: string, callback?: Function): Promise<any> {
    var defer: any = PromiseWrapper.completer();

    this.read(dataUrl)
      .subscribe((data: any) => this.upload(uploadUrl, data).subscribe(defer.resolve, defer.reject), defer.reject);

    return defer.promise;
  }

  upload(path: string, body: Array<any>): Observable<any> {

    var payload: string = '';
    for (var item of body) {
      payload += '\n' + JSON.stringify({
        index: {
          _id: item._id
        }
      });

      delete item._id;
      payload += '\n' + JSON.stringify(item);
    }

	  payload += '\n';

    return this.request(path, RequestMethod.Post, payload).map((res: Response) => res.json());
  }

  read(path: string, search?: Object): Observable<any> {
    return this.request(path, RequestMethod.Get, null, search).map((res: Response) => res.json());
  }

  clearData(url: string): Promise<any> {
    var defer: any = PromiseWrapper.completer();

    this.request(url, RequestMethod.Delete, null, null)
      .map((res: Response) => res.json())
      .subscribe(defer.resolve, defer.reject);

    return defer.promise;
  }

  private request(path: string, method: RequestMethod, body?: string, search?: Object): Observable<Response> {
    let options: RequestOptions = new RequestOptions(this.restOptions.merge({
      method: method,
      url: path,
      body: body,
      search: this.serialize(search)
    }));

    return this.http.request(new Request(options));
  }

  private serialize(obj: Object): string {
    var str: string[] = [];

    for (let p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
    }

    return str.join('&');
  }
}
