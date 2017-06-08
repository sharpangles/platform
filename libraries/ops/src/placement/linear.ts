import { PlacementChange } from './placement';
import { Surface } from './surface';
import { Placement } from './placement';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export interface LinearPlacement extends Placement {
    index: number;
}

/** @todo dimensional library stuff here, but for now just a simple surface implementation. */
export class LinearSurface<T> implements Surface<T> {
    [Symbol.iterator](): IterableIterator<T> { return this.line.values(); }

    line: T[] = [];

    place(item: T, placement?: LinearPlacement): PlacementChange<T>[] {
        let index = placement ? placement.index : this.line.length;
        this.line.splice(index, 0, item);
        let result = this.line.slice(index).map((i, ind) => <PlacementChange<T>>{ item: i, previous: ind === 0 ? undefined : ind - 1, current: ind });
        this.placedSubject.next(result);
        return result;
    }

    remove(item: T): PlacementChange<T>[] {
        return this.removeAt(<LinearPlacement>{ index: this.line.indexOf(item) });
    }

    removeAt(placement: LinearPlacement): PlacementChange<T>[] {
        if (placement.index < 0)
            return [];
        let removed = this.line.splice(placement.index, 1);
        let result = [<PlacementChange<T>>{ item: removed[0], previous: placement.index }].concat(this.line.slice(placement.index).map((i, ind) => <PlacementChange<T>>{ item: i, previous: ind + 1, current: ind }));
        this.removedSubject.next(result);
        return result;
    }

    find(item: T) {
        let index = this.line.indexOf(item);
        if (index < 0)
            return;
        return { index: index };
    }

    findAt(placement: LinearPlacement) {
        if (placement.index < 0 || placement.index >= this.line.length)
            return;
        return this.line[placement.index];
    }

    private placedSubject = new Subject<PlacementChange<T>[]>();
    placed: Observable<PlacementChange<T>[]>;
    private removedSubject = new Subject<PlacementChange<T>[]>();
    removed: Observable<PlacementChange<T>[]>;
}
