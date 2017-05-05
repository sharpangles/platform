import { Observable } from 'rxjs/Observable';
import { Tracker } from './tracker';
import { RollupCompiler } from './rollup_compiler';

/**
 * There is also rollup-watch, but we want control over the trigger.
 */
export class RollupTracker extends Tracker<any, boolean> {
    constructor(observable: Observable<any>, public rollupCompiler: RollupCompiler, public buildEs: boolean = true, public buildUmd: boolean = true) {
        super(observable);
    }

    protected async onRunAsync(source: any): Promise<boolean | undefined> {
        try {
            let promises: Promise<any>[] = [];
            if (this.buildEs)
                promises.push(this.rollupCompiler.buildEsAsync());
            if (this.buildUmd)
                promises.push(this.rollupCompiler.buildUmdAsync());
            await Promise.all(promises);
            return true;
        }
        catch (ex) {
            console.log(ex);
            return;
        }
    }
}
