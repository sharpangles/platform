import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

export class DynamicMerge<TKey, T> {
    subscriptions = new Map<TKey, Subscription>();
    private subject = new Subject<T>();

    set(key: TKey, observable: Observable<T>) {
        if (this.subscriptions.has(key))
            throw new Error('Duplicate key.');
        this.subscriptions.set(key, observable.subscribe(this.subject));
    }

    delete(key: TKey): boolean {
        let sub = this.subscriptions.get(key);
        if (!sub)
            return false;
        this.subscriptions.delete(key);
        sub.unsubscribe();
        return true;
    }

    get observable(): Observable<T> { return this.subject; }

    dispose() {
        for (let sub of this.subscriptions.values())
            sub.unsubscribe();
        this.subscriptions.clear();
    }
}
