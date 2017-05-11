import { TrackerProcess } from './tracker_process';
import { SubjectTracker } from './subject_tracker';

/**
 * A tracker that waits for the previous process to finish.
 */
export class MutexTracker<TProcess extends TrackerProcess<TProgress, TError> = TrackerProcess<TProgress, TError>, TConfig = any, TConnectState = any, TProgress = any, TError = any> extends SubjectTracker<TProcess, TConfig, TConnectState, TProgress, TError> {
    constructor(processFactory?: (state?: TConnectState) => TProcess | undefined) {
        super(processFactory);
    }

    get activeProcess(): TProcess | undefined {
        for (let cur of this.activeProcesses)
            return cur;
        return;
    }

    protected addProcess(trackerProcess: TProcess) {
        super.addProcess(trackerProcess);
        return this.activeProcess === trackerProcess;
    }

    protected queue: TProcess[] = [];

    protected removeProcess(trackerProcess: TProcess) {
        super.removeProcess(trackerProcess);
        if (trackerProcess !== this.queue.splice(0, 1)[0])
            throw new Error('Out of order queue.');
        if (this.queue.length > 0)
            super.startProcess(this.queue[0]);
    }

    protected startProcess(trackerProcess: TProcess) {
        this.queue.push(trackerProcess);
        if (this.queue.length === 1)
            super.startProcess(trackerProcess);
    }
}
