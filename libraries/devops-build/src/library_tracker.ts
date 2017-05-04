import { RollupTracker } from './rollup_tracker';
import { TypescriptTracker } from './typescript_tracker';

export class LibraryTracker {
    constructor(public scope: string, public name: string, cwd?: string, watch?: boolean) {
        this._cwd = cwd || process.cwd();
        this.typescriptTracker = new TypescriptTracker(this._cwd, undefined, watch);
        this.rollupTracker = new RollupTracker(this.scope, this.name);
        this.typescriptTracker.changed.subscribe(c => this.rollupTracker.rollupAsync());
        this.typescriptTracker.run();
    }

    private _cwd: string;

    typescriptTracker: TypescriptTracker;
    rollupTracker: RollupTracker;
}
