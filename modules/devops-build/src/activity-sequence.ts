import { Activity } from './activity';

export class ActivitySequence extends Activity {
    constructor(public name: string) {
        super();
    }

    sequence: ({ activities: Activity[], concurrency: number })[] = [];
    failed: Activity[] = [];

    add(activities: Activity | Activity[], concurrency = 6) {
        this.sequence.push({ activities: Array.isArray(activities) ? activities : [activities], concurrency: concurrency });
    }

    async runConcurrent(commandRuns: Activity[], concurrency: number): Promise<boolean> {
        const promiseFactories = commandRuns.map((r, i) =>  <{ activity: Activity, factory: () => Promise<boolean>, promise?: Promise<void> }>{ activity: r, factory: () => r.runAsync() });
        for (let i = 0; i < promiseFactories.length; i++) {
            const promiseFactory = promiseFactories[i];
            const running = promiseFactories.filter(f => f.promise).map(f => f.promise);
            if (running.length === concurrency)
                await Promise.race(running);
            else
                await new Promise(resolve => setTimeout(resolve, 100)); // Stagger things a little, helps resolve stuff that doesn't work well in parallel (like npm).
            promiseFactory.promise = promiseFactory.factory().then(success => {
                if (!success)
                    this.failed.push(promiseFactory.activity);
                delete promiseFactory.promise;
            });
        }
        await Promise.all(promiseFactories.filter(f => f.promise).map(f => f.promise));
        return this.failed.length === 0;
    }

    toString(): string { return this.name; }

    protected async onRunAsync() {
        for (const stage of this.sequence) {
            const result = await this.runConcurrent(stage.activities, stage.concurrency);
            if (!result)
                return false;
        }
        return true;
    }
}
