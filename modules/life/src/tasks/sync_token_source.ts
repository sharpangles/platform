import { SyncToken } from './sync_token';
import { SyncSubscriber } from './sync_subscriber';

export enum SyncStage {
    Started,
    Voting,
    RollingBack,
    RolledBack,
    Committing,
    Committed
}

export class SyncTokenSource {
    token = new SyncToken(this);
    stage = SyncStage.Started;

    private syncs: SyncSubscriber[] = [];

    sync(syncSubscriber: SyncSubscriber): () => void {
        this.syncs.push(syncSubscriber);
        return () => { this.syncs.splice(this.syncs.indexOf(syncSubscriber), 1); };
    }

    rollback() {
        if (this.stage === SyncStage.Committing || this.stage === SyncStage.Committed)
            throw new Error('Already commiting.');
        if (this.stage === SyncStage.RollingBack || this.stage === SyncStage.RolledBack)
            return;
        this.stage = SyncStage.RollingBack;
        let promises = this.syncs.map(s => s.rollback && s.rollback()).filter(p => (<any>p).then);
        if (promises.length > 0)
            Promise.all(promises).then
    }

    static createLinkedTokenSource(...tokens: (SyncToken | undefined)[]): SyncTokenSource {
        tokens = tokens.filter(t => t);
        if (tokens.length === 1)
            return (<any>tokens[0]).syncTokenSource;
        let syncTokenSource = new SyncTokenSource();
        // let cancelled = false;
        let rolledBack = tokens.concat([syncTokenSource.token]);
        syncTokenSource.sync({
            rollback: () => this.ensureRollback,
            rolledBack: () => syncTokenSource.rolledBack(),
            vote: () => Promise<boolean> | boolean;
            commit: () => Promise<void> | void;
            committed: () => void;
        });
        for (let token of <SyncToken[]>tokens) {
            token.sync({
                rollback: () => syncTokenSource.rollback(),
                rolledBack: () => syncTokenSource.rolledBack(),
                vote: () => Promise<boolean> | boolean;
                commit: () => Promise<void> | void;
                committed: () => void;

                // rollback?: () => Promise<void> | void;
                // rolledBack?: () => void;
                // vote?: () => Promise<boolean> | boolean;
                // commit?: () => Promise<void> | void;
                // committed?: () => void;
            })
            // token.register(() => {
            //     if (cancelled)
            //         return;
            //     syncTokenSource.cancel();
            //     cancelled = true;
            // });
        }
        return syncTokenSource;
    }
}

//     registerRollback(callback: () => Promise<void> | undefined) {
//         if (this.rollbackRegistrations)
//             this.rollbackRegistrations.push(callback);
//         else
//             this.rollbackRegistrations = [callback];
//     }

//     registerRolledBack(callback: () => void) {
//         if (this.rolledBackRegistrations)
//             this.rolledBackRegistrations.push(callback);
//         else
//             this.rolledBackRegistrations = [callback];
//     }

//     registerCanCommit(callback: () => Promise<boolean> | boolean) {
//         if (this.canCommitRegistrations)
//             this.canCommitRegistrations.push(callback);
//         else
//             this.canCommitRegistrations = [callback];
//         this.canCommitRegistrations.push(callback);
//     }

//     registerCommit(callback: () => Promise<void> | undefined) {
//         if (this.commitRegistrations)
//             this.commitRegistrations.push(callback);
//         else
//             this.commitRegistrations = [callback];
//     }

//     registerCommitted(callback: () => void) {
//         if (this.committedRegistrations)
//             this.committedRegistrations.push(callback);
//         else
//             this.committedRegistrations = [callback];
//     }

//     isCommitted = false;
//     inRollback = false;
//     inRolledBack = false;

//     private commitRegistrations: (() => void)[];
//     private canCommitRegistrations: (() => Promise<boolean> | boolean)[];
//     private committedRegistrations: (() => void)[];
//     private rollbackRegistrations: (() => Promise<void> | undefined)[];
//     private rolledBackRegistrations: (() => void)[];

//     async rollback() {
//         if (this.stage > SyncStage.Voting)
//             throw new Error('Can no longer rollback.');
//         this.stage = SyncStage.RollingBack;
//         if (this.rollbackRegistrations) {
//             let promises = <Promise<void>[]>this.rollbackRegistrations.map(r => r()).filter(r => r);
//             if (promises.length > 0)
//                 await Promise.all(promises);
//         }
//         for (let rolledBack of this.rolledBackRegistrations)
//             rolledBack();
//         this.stage = SyncStage.RolledBack;
//     }

//     async commit() {
//         if (this.stage > SyncStage.Started)
//             throw new Error('Can no longer commit.');
//         this.stage = SyncStage.Voting;
//         if (this.canCommitRegistrations) {
//             let results = this.canCommitRegistrations.map(r => r());
//             let promises = results.filter(r => (<Promise<boolean>>r).then);
//             if (promises.length > 0 && (await Promise.all(promises)).find(r => r) || results
//         }
//         for (let rolledBack of this.rolledBackRegistrations)
//             rolledBack();
//         this.stage = SyncStage.Committed;
//     }

//     static createLinkedTokenSource(...tokens: (SyncToken | undefined)[]): SyncTokenSource {
//         tokens = tokens.filter(t => t);
//         if (tokens.length === 1)
//             return (<any>tokens[0]).syncTokenSource;
//         let syncTokenSource = new SyncTokenSource();
//         let cancelled = false;
//         for (let token of <SyncToken[]>tokens) {
//             token.register(() => {
//                 if (cancelled)
//                     return;
//                 syncTokenSource.cancel();
//                 cancelled = true;
//             });
//         }
//         return syncTokenSource;
//     }
// }
