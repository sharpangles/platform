import { SyncSubscriber } from './sync_subscriber';
import { SyncTokenSource } from './sync_token_source';
import { CancellationToken } from './cancellation_token';

export class SyncToken {
    /** @internal */
    constructor(private syncTokenSource: SyncTokenSource) {
    }

    sync(syncSubscriber: SyncSubscriber) {
        return this.syncTokenSource.sync(syncSubscriber);
    }

    asCancellationToken() {
        return new CancellationToken(this.syncTokenSource);
    }
}

//     registerRollback(callback: () => Promise<void> | undefined) {
//         this.syncTokenSource.registerRollback(callback);
//     }

//     registerRolledBack(callback: () => void) {
//         this.syncTokenSource.registerRolledBack(callback);
//     }

//     /** The beginning of the expanding phase for two-phase locking, and the vote for two-phase commit. */
//     registerCanCommit(callback: () => Promise<boolean> | boolean) {
//         this.syncTokenSource.registerCanCommit(callback);
//     }

//     /** The end of the expanding phase for two-phase locking, and optionally the beginning of the shrinking phase. */
//     registerCommit(callback: () => Promise<void> | undefined) {
//         this.syncTokenSource.registerCommit(callback);
//     }

//     /**
//      * Additional phase allowing the detection of a failed coordination by participants (ie. if this is never called).
//      * May trigger an untracked shrinking phase for the listener.
//      */
//     registerCommitted(callback: () => void) {
//         this.syncTokenSource.registerCommitted(callback);
//     }

//     asCancellationToken() {
//         return new CancellationToken(this.syncTokenSource);
//     }
// }
