
import {Page} from '../state/pagination';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {Dispatcher} from '../state/Dispatcher';

export abstract class DataStore<M>  {

  protected url: string;

  constructor(protected dispatcher: Dispatcher) {
    this.registerForActions(dispatcher);
  }

  registerForActions(dispatcher: Dispatcher) {
    // Not implemented
  }

  read(id: string): Observable<M> {
    return Observable.create((observer: Observer<M>) => {
      observer.complete();
    }).share();
  }


  fetch(item: M, page: Page<M>): Observable<Page<M>> {
    return Observable.create((observer: Observer<Page<M>>) => {
      observer.complete();
    }).share();
  }

  save(item: M): Observable<M> {
    return Observable.create((observer: Observer<M>) => {
      observer.complete();
    }).share();
  }

  saveBulk(items: M[]): Observable<M> {
    return Observable.create((observer: Observer<M>) => {
      observer.complete();
    }).share();
  }

  delete(item: M): Observable<M> {
    return Observable.create((observer: Observer<M>) => {
      observer.complete();
    }).share();
  }

  deleteBulk(items: M[]): Observable<M> {
    return Observable.create((observer: Observer<M>) => {
      observer.complete();
    }).share();
  }

}