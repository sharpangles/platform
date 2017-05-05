import { Tracker } from './tracker';

export class PlatformTracker extends Tracker<any, boolean> {
    protected onRunAsync(source: any): Promise<boolean | undefined> {
        throw 'not implemented';
    }
}
