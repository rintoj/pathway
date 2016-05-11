import {Observer} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';

export class ObservableUtil {

    static observeOnce<R>(observable: Observable<R>): Observable<R> {
        let nextObservable: Observable<R> = Observable.create((observer: Observer<R>) => {
            observable
                .catch((error: any): any => {
                    observer.error(error);
                    observer.complete();
                    return Observable.empty();
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
