export interface Placement {
}

export interface PlacementChange<T> {
    item: T;
    previous?: Placement;
    current?: Placement;
}
