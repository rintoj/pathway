import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';

export class ObservableUtil {

    static observeNextOnce<R>(observable: Observable<R>): Observable<R> {
        let nextObservable: Observable<R> = Observable.create((observer: Observer<R>) => {
            observable.subscribe(
                (value: R) => {
                    observer.next(value);
                    observer.complete();
                },
                (error: any) => {
                    observer.next(error);
                    observer.complete();
                }, () => observer.complete()
            );
        }).share();
        nextObservable.subscribe();
        return nextObservable;
    }
}