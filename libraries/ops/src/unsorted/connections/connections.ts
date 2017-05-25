import { Description } from '../description';
import { TrackerProcess } from '../tracker_process';
import { ConfigurationConnection } from './configuration_connection';
import { RunConnection } from './run_connection';
import { Tracker } from '../tracker';

/**
 * Connections provide a context independent of trackers.
 */
export class Connections {
    static runOnSuccess<TProcess extends TrackerProcess = any, TState = any>(source: Tracker, target: Tracker, description: Description, connectionStateFactory?: (result: TProcess) => TState) {
        return new RunConnection<TProcess, TState>(source, target, description, s => s.succeeded, connectionStateFactory);
    }

    static runOnProgress<TProcess extends TrackerProcess = any, TProgress = any, TState = any>(source: Tracker, target: Tracker, description: Description, connectionStateFactory?: (result: { trackerProcess: TProcess, progress: TProgress }) => TState) {
        return new RunConnection<{ trackerProcess: TProcess, progress: TProgress }, TState>(source, target, description, s => s.progressed, connectionStateFactory);
    }

    static configOnSuccess<TProcess extends TrackerProcess = any, TConfig = any>(source: Tracker, target: Tracker, description: Description, configFactory?: (result: TProcess) => TConfig) {
        return new ConfigurationConnection<TProcess, TConfig>(source, target, description, s => s.succeeded, configFactory);
    }

    static configOnProgress<TProcess extends TrackerProcess = any, TProgress = any, TConfig = any>(source: Tracker, target: Tracker, description: Description, configFactory?: (result: { trackerProcess: TProcess, progress: TProgress }) => TConfig) {
        return new ConfigurationConnection<{ trackerProcess: TProcess, progress: TProgress }, TConfig>(source, target, description, s => s.progressed, configFactory);
    }
}
