import { Tracker } from './tracker';
import { TrackerFactory } from './tracker_factory';

export class TrackerContext {
    onTrackersCreated(factory: TrackerFactory, trackers: Tracker[]) {
        for (let tracker of trackers)
            this.enableLogging(tracker);
    }

    private enableLogging(tracker: Tracker) {
        tracker.started.subscribe(proc => console.log(`Started: ${tracker.constructor.name}.${proc.constructor.name}`));
        tracker.progressed.subscribe(proc => console.log(`Progress: ${tracker.constructor.name}.${proc.trackerProcess.constructor.name} - ${typeof proc.progress === 'string' ? proc.progress : JSON.stringify(proc.progress)}`));
        tracker.succeeded.subscribe(proc => console.log(`Succeeded: ${tracker.constructor.name}.${proc.constructor.name}`));
        tracker.failed.subscribe(proc => console.log(`Failed: ${tracker.constructor.name}.${proc.trackerProcess.constructor.name} - ${typeof proc.error === 'string' ? proc.error : proc.error instanceof Error ? proc.error.message : JSON.stringify(proc.error)}`));
        tracker.cancelling.subscribe(proc => console.log(`Cancelling: ${tracker.constructor.name}.${proc.trackerProcess.constructor.name}`));
        tracker.cancelled.subscribe(proc => console.log(`Cancelled: ${tracker.constructor.name}.${proc.constructor.name}`));
    }
}
