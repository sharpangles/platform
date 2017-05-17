import { TerminalTrackerContext } from './terminal_tracker_context';
import { ConfigurationTrackerFactory, TrackerContext, TypescriptTracker } from '@sharpangles/devops-build';

export class ContextFactory {
    async buildAsync(completeOnBuild: boolean) {
        let trackerContext: TrackerContext = completeOnBuild ? new TerminalTrackerContext(TypescriptTracker) : new TrackerContext();
        let factory = new ConfigurationTrackerFactory(trackerContext, { localConfigPath: this.findConfigPath() }, this.getCwd());
        await factory.createTrackersAsync();
        factory.start();
    }

    getCwd(): string | undefined {
        return;
    }

    /** If running platform-level operations, determine if we need to navigate upward to find the root. */
    findConfigPath() {
        return '../../';
    }
}
