import { CancellationToken } from '../tasks/cancellation_token';
import { TaskCancelledError } from '../tasks/task_cancelled_error';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/toPromise';

/**
 * @param onCancelled If provided, the promise does not reject.
 */
function toCancellablePromise<T>(this: Observable<T>, cancellationToken?: CancellationToken, onCancelled?: (err: TaskCancelledError) => void): Promise<T> {
    if (!cancellationToken)
        return this.toPromise();
    let untilSubject: Subject<void>;
    let cancelled = false;
    untilSubject = new Subject<void>();
    cancellationToken.register(() => { cancelled = true; untilSubject.next(); });
    return new Promise((resolve, reject) => {
      let value: T;
      let observable = cancellationToken ? this.takeUntil(untilSubject) : this;
      observable.subscribe(
          (x: T) => value = x,
          (err: any) => reject(err),
          () => {
              if (!cancelled) {
                  resolve(value);
                  return;
              }
              else if (onCancelled) {
                  onCancelled(new TaskCancelledError());
                  resolve(value);
              }
              else
                  reject(new TaskCancelledError());
          });
    });
}

declare module 'rxjs/Observable' {
    export interface Observable<T> {
        toCancellablePromise<T>(this: Observable<T>, cancellationToken?: CancellationToken, onCancelled?: (err: TaskCancelledError) => void): Promise<T>;
    }
}

(<any>Observable.prototype).toCancellablePromise = toCancellablePromise;
