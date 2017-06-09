import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export interface ArrangementEntry<TArranged, TType = any, TLocation = any> {
    type: TType;
    location: TLocation;
    arranged: TArranged;
}

export interface ArrangementChange<TArranged, TType = any, TLocation = any> extends ArrangementEntry<TArranged, TType, TLocation> {
    /** Present if moved */
    oldLocation?: TLocation;
    added?: boolean;
    removed?: boolean;
}

/**
 * Handles the storage and location of items in a system graph component.
 * @param TType A unique implementation type
 * @param TLocation The location type used to handle spatial location (possibly including collision detection)
 * @param TArranged The type of item arranged
 */
export interface Arrangement<TArranged, TType = any, TLocation = any> extends Iterable<ArrangementChange<TArranged, TType, TLocation>> {
    filter(type?: TType, location?: TLocation): Iterable<ArrangementEntry<TArranged, TType, TLocation>>;
    add(type: TType, location: TLocation, arranged: TArranged): Iterable<ArrangementChange<TArranged, TType, TLocation>>;
    remove(arranged: TArranged): Iterable<ArrangementChange<TArranged, TType, TLocation>>;
    move(arranged: TArranged, newLocation: TLocation): Iterable<ArrangementChange<TArranged, TType, TLocation>>;
    changed: Observable<Iterable<ArrangementChange<TArranged, TType, TLocation>>>;
}

/**
 * @todo Could bring in Boundaries, AlignedHilbertSpace, etc... Sticking with simple implementation for now.
 */
export class LinearArrangement<TArranged, TType = any> implements Arrangement<TArranged, TType, number> {
    private itemsByReference = new Map<TArranged, ArrangementEntry<TArranged, TType, number>>();

    [Symbol.iterator](): IterableIterator<ArrangementChange<TArranged, TType, number>> { return this.itemsByReference.values(); }

    *filter(type?: TType, location?: number): Iterable<ArrangementEntry<TArranged, TType, number>> {
        for (let entry of this.itemsByReference.values()) {
            if ((typeof type === 'undefined' || entry.type === type) && (typeof location === 'undefined' || entry.location === location))
            yield entry;
        }
    }

    add(type: TType, location: number, arranged: TArranged): Iterable<ArrangementChange<TArranged, TType, number>> {
        let changes = [<ArrangementChange<TArranged, TType, number>>{ type: type, location: location, arranged: arranged, added: true }];
        for (let item of this.itemsByReference.values()) {
            if (item.location >= location) {
                item.location++;
                changes.push({ type: item.type, location: item.location, arranged: item.arranged, oldLocation: item.location - 1 });
            }
        }
        this.itemsByReference.set(arranged, { type: type, location: location, arranged: arranged });
        this.changedSubject.next(changes);
        return changes;
    }

    remove(arranged: TArranged): Iterable<ArrangementChange<TArranged, TType, number>> {
        let entry = this.itemsByReference.get(arranged);
        if (!entry)
            throw new Error('Not found');
        let changes = [<ArrangementChange<TArranged, TType, number>>{ type: entry.type, location: entry.location, arranged: entry.arranged, removed: true }];
        this.itemsByReference.delete(arranged);
        for (let item of this.itemsByReference.values()) {
            if (item.location >= entry.location) {
                item.location--;
                changes.push({ type: item.type, location: item.location, arranged: item.arranged, oldLocation: item.location + 1 });
            }
        }
        this.changedSubject.next(changes);
        return changes;
    }

    move(arranged: TArranged, newLocation: number): Iterable<ArrangementChange<TArranged, TType, number>> {
        let entry = this.itemsByReference.get(arranged);
        if (!entry)
            throw new Error('Not found');
        let changes = [<ArrangementChange<TArranged, TType, number>>{ type: entry.type, location: newLocation, arranged: entry.arranged, oldLocation: entry.location }];
        for (let item of this.itemsByReference.values()) {
            if (item.arranged === arranged)
                continue;
            if (item.location >= entry.location && item.location <= newLocation) {
                item.location--;
                changes.push({ type: item.type, location: item.location, arranged: item.arranged, oldLocation: item.location + 1 });
            }
            else if (item.location <= entry.location && item.location >= newLocation) {
                item.location++;
                changes.push({ type: item.type, location: item.location, arranged: item.arranged, oldLocation: item.location - 1 });
            }
        }
        entry.location = newLocation;
        this.changedSubject.next(changes);
        return changes;
    }

    private changedSubject = new Subject<Iterable<ArrangementChange<TArranged, TType, number>>>();
    get changed(): Observable<Iterable<ArrangementChange<TArranged, TType, number>>> { return this.changedSubject; }
}
