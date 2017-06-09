import { Arranger } from './arranger';
import { DataType } from './decorators/data_type';
import { Bus } from '@sharpangles/ops';

export class OpsPackage<TKey> {
    dataTypes?: Map<TKey, DataType>;
    busses?: Map<TKey, Bus>;
    arrangers?: Map<TKey, Arranger>;
    memberships?: Iterable<OpsMembershipSet<TKey>>;
}

/**
 * Adds a set of available associations.
 * Arrangers use this to understand possible edits that can be made.
 * For example, a set of tracker keys may support adding certain interface keys.
 */
export interface OpsMembershipSet<TKey> {
    parentKeys: Iterable<TKey>;
    childKeys: Iterable<TKey>;
}
