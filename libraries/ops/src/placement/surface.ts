import { Placement, PlacementChange } from './placement';

export interface Surface<T> {
    place(item: T, placement?: Placement): PlacementChange<T>[];
    remove(item: T): PlacementChange<T>[];
    removeAt(placement: Placement): PlacementChange<T>[];
    find(item: T): Placement | undefined;
    findAt(placement: Placement): T | undefined;
}
