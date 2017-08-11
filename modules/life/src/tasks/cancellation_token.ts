import { SyncTokenSource, SyncStage } from './sync_token_source';
import { SyncToken } from './sync_token';

export class CancellationToken {
    /** @internal */
    constructor(private syncTokenSource: SyncTokenSource) {
    }

    get isCancellationRequested(): boolean { return this.syncTokenSource.stage === SyncStage.RolledBack || this.syncTokenSource.stage === SyncStage.RollingBack; }

    register(callback: () => void) {
        this.syncTokenSource.sync({ rollback: callback });
    }

    asPromise() {
        if (this.isCancellationRequested)
            return Promise.resolve();
        return new Promise<void>(resolve => this.register(() => resolve()));
    }

    asSyncToken(): SyncToken {
        return this.syncTokenSource.token;
    }
}
