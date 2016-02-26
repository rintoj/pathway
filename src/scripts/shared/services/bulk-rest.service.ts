import 'rxjs/add/operator/map';

import {Observable} from 'rxjs';
import {Injectable} from 'angular2/core';
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

  uploadSampleData(callback: Function) {
    this.read('//localhost:8080/sample-data.json')
      .subscribe((data: any) => {
      this.upload('//localhost:9200/pathway/projectlog/_bulk', data)
        .subscribe(() => callback(true), () => callback(false));
    }, () => callback(false));
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

    return this.request(path, RequestMethod.Post, payload).map((res: Response) => res.json());
  }

  read(path: string, search?: Object): Observable<any> {
    return this.request(path, RequestMethod.Get, null, search).map((res: Response) => res.json());
  }

  clearData(callback: Function) {
    this.request('//localhost:9200/pathway', RequestMethod.Delete, null, null)
      .map((res: Response) => res.json())
      .subscribe(
      () => { callback(true); },
      () => { callback(false); }
      );
  }

  private request(path: string, method: RequestMethod, body?: string, search?: Object): Observable<Response> {
    let options = new RequestOptions(this.restOptions.merge({
      method: method,
      url: path,
      body: body,
      search: this.serialize(search)
    }));

    return this.http.request(new Request(options));
  }

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
