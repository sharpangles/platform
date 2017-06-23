import { CancellationToken, MessageValidation } from '@sharpangles/lang';
import { OutputConnector, SubjectOutputConnector, SubscribingInputConnector } from './connector';
import { Remover } from './removable';
import { Tracker } from './tracker';
import { ConnectionResult, createCompositeConnectionResult } from './connectable';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/fromPromise';


// TODO:
// - Query ability by type and path restrictions (allowing descendents, ancestors, path reversals, etc...)
// - What do we name 'removers'?  Its the base class for all the stuff that we actually see and interact with.  'Connection' is just the glue.







/**
 * An item added to a tracker as an interface, capable of manipulating the system graph.
 */
export class Arranger {
    constructor(public tracker?: Tracker) {
    }

    /** Sets the arranger configuration for the first time. */
    async configAsync(config: any, cancellationToken?: CancellationToken): Promise<void> {
        // let promise = this.onInitializeAsync(config, cancellationToken);
        // let initializedConnector = new OutputConnector<void>(this, Observable.fromPromise(promise));
        // let result = await this.addChildAsync(initializedConnector, cancellationToken);
        // if (result.canCommit && result.canCommit())
        //     result.commit && result.commit();
        // else {
        //     result.rollback && result.rollback();
        //     throw new Error(`Unable to add 'initialized' connector.`);
        // }
        // await promise;
    }

    protected registeredRemovals = new Set<Remover>();

    protected getRemovals(cancellationToken?: CancellationToken): Promise<ConnectionResult>[] {
        return super.getRemovals(cancellationToken).concat(Array.from(this.registeredRemovals).map(r => r.unregisterArrangerAsync(this, cancellationToken)));
    }

    dispose() {
    }
}

/** An arranger that adds trackers of arrangers */
export class ArrangerArranger extends Arranger {
    constructor(tracker: Tracker) {
        super(tracker);
    }

    /** Sets the arranger configuration for the first time. */
    async initializeAsync(config: any): Promise<void> {
        this.registerArranger(this);
    }

    async createConfigTrackerChainAsync() {
    }

    async createArrangerTrackerAsync<TConfig>(arranger: Arranger, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
        // let systemPromise = this.system.addChildAsync(tracker, cancellationToken);
        // tracker.registerRemoval(() => arranger.dispose());
        // let updateConnector = new SubscribingInputConnector<TConfig>(this, c => arranger.updateAsync(c));
        // let updateConnectorPromise = tracker.addChildAsync(updateConnector, cancellationToken);

        let tracker = new Tracker(this.tracker);
        await tracker.registerArranger(this);
        tracker.registerRemoval(() => arranger.dispose());
        let configConnector = new SubjectOutputConnector<void>(tracker);
        let configPromise = tracker.addChildAsync(configConnector, cancellationToken);
        let results = await Promise.all([configPromise]);
        return createCompositeConnectionResult(results, isValid => isValid ? undefined : new MessageValidation('Failed to create arranger'));
    }
}

export async function addPromiseConnectorsToTrackerAsync(tracker: Tracker, promiseFactory: () => Promise<void>, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
    // @todo Would be nice if we could create a async queue bus between in front of this input connector and wrap that up as a connector...(i.e. hide the bus internally in here)
    let outputConnector = new SubjectOutputConnector<void>(tracker);
    let inputConnector = new SubscribingInputConnector<void>(tracker, () => promiseFactory().then(r => outputConnector.subject.next(r)));
    let outputConnectorPromise = tracker.addChildAsync(outputConnector, cancellationToken);
    let inputConnectorPromise = tracker.addChildAsync(inputConnector, cancellationToken);
    let results = await Promise.all([outputConnectorPromise, inputConnectorPromise]);
    return createCompositeConnectionResult(results, isValid => isValid ? undefined : new MessageValidation('Failed to create promise connectors'));
}
