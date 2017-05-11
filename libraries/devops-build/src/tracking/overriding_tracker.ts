import { TrackerProcess } from './tracker_process';
import { MutexTracker } from './mutex_tracker';

/**
 * A tracker that cancels any existing process when triggered.
 */
export class OverridingTracker<TProcess extends TrackerProcess<TProgress, TError> = TrackerProcess<TProgress, TError>, TConfig = any, TConnectState = any, TProgress = any, TError = any> extends MutexTracker<TProcess, TConfig, TConnectState, TProgress, TError> {
    constructor(processFactory?: (state?: TConnectState) => TProcess | undefined) {
        super(processFactory);
    }

    protected startProcess(trackerProcess: TProcess) {
        if (this.activeProcess)
            this.activeProcess.cancelAsync();
        super.startProcess(trackerProcess);
    }
}
