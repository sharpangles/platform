import { Tracker } from './tracker';

export interface TrackerFactory {
    createTrackersAsync(tracker: Tracker): Promise<void>;
    start(): void;
}
