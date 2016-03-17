import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';

export class ObservableUtil {

    static observeOnce<R>(observable: Observable<R>): Observable<R> {
        let nextObservable: Observable<R> = Observable.create((observer: Observer<R>) => {
            observable
                .catch((error: any): any => {
                    observer.error(error);
                    observer.complete();
                })
                .subscribe(
                (value: R) => {
                    observer.next(value);
                    observer.complete();
                },
                (error: any) => {
                    observer.error(error);
                    observer.complete();
                }, () => observer.complete()
                );
        }).share();

        nextObservable.subscribe();
        return nextObservable;
    }
}