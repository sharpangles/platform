import { TypescriptIncrementalCompiler } from './typescript_incremental_compiler';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import { TypescriptCompiler } from './typescript_compiler';
import { Tracker } from './tracker';
import { WatchChange, Watcher } from './watcher';
import { ParsedCommandLine } from 'typescript';

export class TypescriptTracker extends Tracker<WatchChange, boolean> {
    static createDefault(cwd?: string, config: ParsedCommandLine | string = 'tsconfig.json', observable?: Observable<WatchChange>) {
        let compiler = new TypescriptCompiler(cwd, config);
        return new TypescriptTracker(compiler, true, observable);
    }

    static createIncremental(cwd?: string, config: ParsedCommandLine | string = 'tsconfig.json', observable?: Observable<WatchChange>, watcher?: Watcher) {
        let compiler = new TypescriptIncrementalCompiler(cwd, config, watcher);
        return new TypescriptTracker(compiler, true, TypescriptTracker.getObservable(compiler, observable));
    }

    static create(compiler: TypescriptCompiler, observable?: Observable<WatchChange>) {
        return new TypescriptTracker(compiler, false, TypescriptTracker.getObservable(compiler, observable));
    }

    private static getObservable(compiler: TypescriptCompiler, observable?: Observable<WatchChange>) {
        return observable && compiler instanceof TypescriptIncrementalCompiler ? Observable.merge(observable, compiler.watcher.changed) : compiler instanceof TypescriptIncrementalCompiler ? compiler.watcher.changed : observable;
    }

    private constructor(public compiler: TypescriptCompiler, private disposeCompiler: boolean, observable?: Observable<WatchChange>) {
        super(observable);
    }

    protected async onRunAsync(source: WatchChange): Promise<boolean | undefined> {
        if (!source.init && (!source.changes || source.changes.length === 0))
            return;
        console.log('Compiling typescript');
        await this.compiler.compileAsync(source && source.changes);
        return true;
    }

    dispose() {
        super.dispose();
        if (this.disposeCompiler)
            this.compiler.dispose();
    }
}
