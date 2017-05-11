import { Tracker } from './tracker';

export interface TrackerFactory {
    createTrackersAsync(tracker?: Tracker): Promise<Tracker[]>;
    start(): void;
}
