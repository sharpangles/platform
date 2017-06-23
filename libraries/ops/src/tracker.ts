import { Bus } from './bus';
import { Remover, Removable } from './removable';
import { InputConnector, OutputConnector } from './connector';
import { ConnectionResult } from './connectable';
import { Arranger } from './arranger';
import { MessageValidation, CancellationToken, CancellationTokenSource, Disposable } from '@sharpangles/lang';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

/**
 * Trackers encapsulate a concept or behavior in an overall system.
 * Systems (which are trackers) provide a hierarchical context.
 * The arranger that created it, or the arrangers that subsequently require it, provide an operational context.
 * When no more arrangers care about the tracker (or any of its children), it is removed.
 *
 * @todo Need DI containers here.  Trackers are a lifetime scope but I cant find any JS DI packages support lifetime (scope/dispose).
 * Its a todo item in inversify, but still doesn't add dispose from what I see yet.
 */
@Disposable()
export class Tracker extends Remover {
    constructor(public parent?: Tracker) {
        super();
    }

    get inputs(): Iterable<InputConnector> { return this._inputConnectors(); }
    private *_inputConnectors() {
        for (let connector of this.children)
            if (connector instanceof InputConnector)
                yield connector;
    }

    get outputs(): Iterable<OutputConnector> { return this._outputConnectors(); }
    private *_outputConnectors() {
        for (let connector of this.children)
            if (connector instanceof OutputConnector)
                yield connector;
    }

    get trackers(): Iterable<Tracker> { return this._trackers(); }
    private *_trackers() {
        for (let tracker of this.children)
            if (tracker instanceof Tracker)
                yield tracker;
    }

    get busses(): Iterable<Bus> { return this._busses(); }
    private *_busses() {
        for (let bus of this.children)
            if (bus instanceof Bus)
                yield bus;
    }

    protected canRemoveAfterUnregistering(arranger: Arranger) {
        return super.canRemoveAfterUnregistering(arranger) && !Array.from(this.trackers).find(t => !t.canRemoveAfterUnregistering(arranger));
    }

    private childAddedSubject = new Subject<Removable>();
    get childAdded(): Observable<Removable> { return this.childAddedSubject; }
    private childRemovedSubject = new Subject<Removable>();
    get childRemoved(): Observable<Removable> { return this.childRemovedSubject; }

    protected childSet = new Set<Removable>();
    get children(): Iterable<Removable> { return this.childSet; }

    async addChildAsync(child: Removable, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        if (this.childSet.has(child))
            return <ConnectionResult>{ validation: new MessageValidation('Child already present.') };
        cancellationToken = CancellationTokenSource.createLinkedTokenSource(this.cancellationTokenSource.token, cancellationToken).token;
        return <ConnectionResult>{
            validation: { isValid: true },
            canCommit: () => {
                if (cancellationToken && cancellationToken.isCancellationRequested || !this.childSet.has(child))
                    return false;
                return true;
            },
            commit: () => this.commitAddChild(child),
            rollback: () => this.rollbackAddChild(child)
        };
    }

    protected rollbackAddChild(child: Removable) {
        this.childAddedSubject.error(new MessageValidation('Add child was rolled back.'));
    }

    protected commitAddChild(child: Removable) {
        this.childSet.add(child);
        this.childAddedSubject.next(child);
    }

    async removeChildAsync(child: Removable, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        if (this.childSet.has(child))
            return <ConnectionResult>{ validation: new MessageValidation('Child already present.') };
        cancellationToken = CancellationTokenSource.createLinkedTokenSource(this.cancellationTokenSource.token, cancellationToken).token;
        return <ConnectionResult>{
            validation: { isValid: true },
            canCommit: () => {
                if (cancellationToken && cancellationToken.isCancellationRequested || this.childSet.has(child))
                    return false;
                return true;
            },
            commit: () => this.commitRemoveChild(child),
            rollback: () => this.rollbackRemoveChild(child)
        };
    }

    protected rollbackRemoveChild(child: Removable) {
        this.childRemovedSubject.error(new MessageValidation('Add child was rolled back.'));
    }

    protected commitRemoveChild(child: Removable) {
        this.childSet.delete(child);
        this.childRemovedSubject.next(child);
    }

    protected commitRemoval(removalResults: ConnectionResult[]) {
        super.commitRemoval(removalResults);
        this.childAddedSubject.complete();
        this.childRemovedSubject.complete();
    }
}
