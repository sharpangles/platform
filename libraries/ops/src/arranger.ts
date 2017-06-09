import { CancellationToken, MessageValidation } from '@sharpangles/lang';
import { SubscribingInputConnector, OutputConnector } from './connector';
import { Interface } from './interface';
import { Tracker } from './tracker';
import { System } from './system';
import { ConnectionResult, createCompositeConnectionResult } from './connectable';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

/**
 * An item added to a tracker as an interface, capable of manipulating the system graph.
 */
export class Arranger {
    /** Sets the arranger configuration and the interface on which it is being added. */
    async initializeAsync(config: any, iface: Interface): Promise<void> {
    }

    /** Allows a tracker to answer if it is able to support a supplied configuration from its current one.  If so, update may be called. */
    compare(config: any): boolean {
        return false;
    }

    /** Updates the arranger to handle the provided configuration.  Called only if its compare call returned true for the same config. */
    async updateAsync(config: any, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        throw new Error('update not supported.');
    }

    private initializedSubject = new Subject<void>();
    get initialized(): Observable<void> { return this.initializedSubject; }
    private updatedSubject = new Subject<void>();
    get updated(): Observable<void> { return this.updatedSubject; }

    dispose() {
    }
}

/** An arranger that adds trackers of arrangers */
export class ArrangerArranger {
    constructor(public system: System) {
    }

    async createArrangerTrackerAsync<TConfig>(arranger: Arranger, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        let tracker = new Tracker(this.system);
        let systemPromise = this.system.addChildAsync(tracker, cancellationToken);
        tracker.registerRemoval(() => arranger.dispose());
        let iface = new Interface(tracker);
        let ifacePromise = tracker.addChildAsync(iface, cancellationToken);
        let updateConnector = new SubscribingInputConnector<TConfig>(iface, c => arranger.updateAsync(c));
        let updateConnectorPromise = iface.addChildAsync(updateConnector, cancellationToken);
        let initializedConnector = new OutputConnector<void>(iface, arranger.updated);
        let initializedConnectorPromise = iface.addChildAsync(initializedConnector, cancellationToken);
        let updatedConnector = new OutputConnector<void>(iface, arranger.updated);
        let updatedConnectorPromise = iface.addChildAsync(updatedConnector, cancellationToken);
        let results = await Promise.all([systemPromise, ifacePromise, updateConnectorPromise, updatedConnectorPromise, initializedConnectorPromise]);
        return createCompositeConnectionResult(results, isValid => isValid ? undefined : new MessageValidation('Failed to create arranger'));
    }
}
