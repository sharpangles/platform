import { Placement, PlacementChange } from './placement';
import { Observable } from 'rxjs/Observable';

export interface Surface<T> extends Iterable<T> {
    place(item: T, placement?: Placement): PlacementChange<T>[];
    remove(item: T): PlacementChange<T>[];
    removeAt(placement: Placement): PlacementChange<T>[];
    find(item: T): Placement | undefined;
    findAt(placement: Placement): T | undefined;
    placed: Observable<PlacementChange<T>[]>;
    removed: Observable<PlacementChange<T>[]>;
}
