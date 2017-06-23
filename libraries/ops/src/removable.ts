import { ConnectionResult } from './connectable';
import { Arranger } from './arranger';
import { MessageValidation, NestedValidation, CancellationToken, CancellationTokenSource, Disposable } from '@sharpangles/lang';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export interface Removable extends Disposable {
    removeAsync(cancellationToken?: CancellationToken): Promise<ConnectionResult>;
    removed: Observable<void>;
}

@Disposable()
export abstract class Remover implements Removable {
    private removedSubject = new Subject<void>();
    get removed(): Observable<void> { return this.removedSubject; }

    abstract get children(): Iterable<Removable>;

    /** A list of arrangers that require this tracker */
    get arrangers(): Iterable<Arranger> { return this.arrangerSet; }
    protected arrangerSet = new Set<Arranger>();

    registerArranger(arranger: Arranger) {
        this.arrangerSet.add(arranger);
    }

    protected canRemoveAfterUnregistering(arranger: Arranger) {
        return this.arrangerSet.size <= 1;
    }

    async unregisterArrangerAsync(arranger: Arranger, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        let result = this.canRemoveAfterUnregistering(arranger) ? await this.removeAsync(cancellationToken) : <ConnectionResult>{ validation: { isValid: true } };
        return <ConnectionResult>{
            validation: result.validation,
            canCommit: () => (!result.canCommit || result.canCommit()) && this.canRemoveAfterUnregistering(arranger),
            commit: () => {
                result.commit && result.commit();
                this.arrangerSet.delete(arranger);
            },
            rollback: result.rollback
        };
    }

    protected getRemovals(cancellationToken?: CancellationToken): Promise<ConnectionResult>[] {
        return Array.from(this.children).map(o => o.removeAsync(cancellationToken));
    }

    async removeAsync(cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        cancellationToken = CancellationTokenSource.createLinkedTokenSource(this.cancellationTokenSource.token, cancellationToken).token;
        let removalResults = await Promise.all(this.getRemovals(cancellationToken));
        if (removalResults.find(r => !r.validation.isValid)) {
            this.rollbackRemoval(removalResults);
            return <ConnectionResult>{ validation: new NestedValidation(new MessageValidation('At least one of the connections could not be disconnected.'), removalResults.map(r => r.validation)) };
        }
        return <ConnectionResult>{
            validation: new NestedValidation(undefined, removalResults.map(r => r.validation)),
            canCommit: () => {
                if (cancellationToken && cancellationToken.isCancellationRequested)
                    return false;
                return !!removalResults.find(r => !!r.canCommit && !r.canCommit());
            },
            commit: () => this.commitRemoval(removalResults),
            rollback: () => this.rollbackRemoval(removalResults)
        };
    }

    protected rollbackRemoval(removalResults: ConnectionResult[]) {
        for (let result of removalResults)
            result.rollback && result.rollback();
        this.removedSubject.error(new MessageValidation('Removal was rolled back.'));
    }

    protected commitRemoval(removalResults: ConnectionResult[]) {
        for (let result of removalResults)
            result.commit && result.commit();
        this.runRemovals();
        this.removedSubject.next();
        this.removedSubject.complete();
    }

    registerRemoval(registration: () => void) {
        if (!this.removals)
            this.removals = [];
        this.removals.push(registration);
    }

    private runRemovals() {
        if (this.removals) {
            for (let removal of this.removals)
                removal();
            delete this.removals;
        }
    }

    private removals?: (() => void)[];

    protected cancellationTokenSource = new CancellationTokenSource();

    dispose() {
        this.runRemovals();
        this.cancellationTokenSource.cancel();
        for (let child of this.children)
            child.dispose();
    }
}
