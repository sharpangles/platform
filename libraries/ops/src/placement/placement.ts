export interface Placement {
}

export interface PlacementChange<T> {
    item: T;
    previous?: Placement;
    current?: Placement;
}

export interface LinearPlacement extends Placement {
    index: number;
}

export interface Surface<T> {
    place(item: T, placement?: Placement): PlacementChange<T>[];
    remove(item: T): PlacementChange<T>[];
    removeAt(placement: Placement): PlacementChange<T>[];
    find(item: T): Placement | undefined;
    findAt(placement: Placement): T | undefined;
}

/** @todo dimensional library stuff here, but for now just a simple surface implementation. */
export class LinearSurface<T> implements Surface<T> {
    line: T[] = [];

    place(item: T, placement?: LinearPlacement): PlacementChange<T>[] {
        let index = placement ? placement.index : this.line.length;
        this.line.splice(index, 0, item);
        return this.line.slice(index).map((i, ind) => <PlacementChange<T>>{ item: i, previous: ind === 0 ? undefined : ind - 1, current: ind });
    }

    remove(item: T): PlacementChange<T>[] {
        return this.removeAt(<LinearPlacement>{ index: this.line.indexOf(item) });
    }

    removeAt(placement: LinearPlacement): PlacementChange<T>[] {
        if (placement.index < 0)
            return [];
        let removed = this.line.splice(placement.index, 1);
        return [<PlacementChange<T>>{ item: removed[0], previous: placement.index }].concat(this.line.slice(placement.index).map((i, ind) => <PlacementChange<T>>{ item: i, previous: ind + 1, current: ind }));
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
}
