import * as rollup from 'rollup';
import * as sourcemapsProxy from 'rollup-plugin-sourcemaps';
import * as nodeResolveProxy from 'rollup-plugin-node-resolve';
import * as builtinsProxy from 'rollup-plugin-node-builtins';
import * as path from 'path';

const nodeResolve: any = (<any>nodeResolveProxy).default || nodeResolveProxy; // https://github.com/rollup/rollup/issues/1267
const sourcemaps: any = (<any>sourcemapsProxy).default || sourcemapsProxy; // https://github.com/rollup/rollup/issues/1267
const builtins: any = (<any>builtinsProxy).default || builtinsProxy; // https://github.com/rollup/rollup/issues/1267

/**
 * There is also rollup-watch, but we want control over the trigger.
 */
export class RollupCompiler {
    constructor(public name: string, private localBuildRoot = './__artifacts/build/index.js', private localReleaseRoot = './__artifacts/release/bundles', cwd?: string) {
        this.cwd = cwd || process.cwd();
    }

    private cwd: string;

    reset() {
        delete this.cache;
        delete this.rollupTask;
    }

    private async setRollupTask() {
        let config = {
            cache: this.cache, // The rollup call is consistent, so it doesnt matter if we contend over this value.
            entry: path.resolve(this.cwd, this.localBuildRoot),
            plugins: [
                nodeResolve(),
                {
                    // Assumes any remaining scoped package is a local neighbor.
                    resolveId: (importee, importer) => {
                        if (!importee.startsWith('@'))
                            return;
                        return path.resolve(this.cwd, importee.substr(importee.indexOf('/') + 1), this.localBuildRoot);
                    }
                },
                sourcemaps(),
                builtins()
            ],
            external: function (id) {
                return !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\\') && !path.isAbsolute(id) ? id : null;
            },
        };
        this.rollupTask = rollup.rollup(config);
        await this.rollupTask;
    }

    private cache?: any;
    private rollupTask?: Promise<any>;

    buildUmdAsync() {
        return this.buildAsync({
            dest: `${this.cwd}/${this.localReleaseRoot}/${this.name.startsWith('@') ? this.name.substr(this.name.indexOf('/') + 1) : this.name }.umd.js`,
            format: 'umd',
            sourceMap: true,
            moduleName: `${this.getGlobalName(this.name)}`,
            globals: function (id) {
                if (id.startsWith('@'))
                    return this._getGlobalName(id);
                if (id.startsWith('rxjs/add/operator'))
                    return 'Rx.Observable.prototype';
                if (id.startsWith('rxjs/add/observable'))
                    return 'Rx.Observable';
                if (id.startsWith('rxjs/'))
                    return 'Rx';
                if (id === 'tslib')
                    return 'tslib';
            }
        });
    }

    async buildEsAsync() {
        return this.buildAsync({
            dest: `${this.cwd}/${this.localReleaseRoot}/${this.name}.es.js`,
            format: 'es',
            sourceMap: true
        });
    }

    private getGlobalName(name: string) {
        return name.replace('@angular/', 'ng.').replace('@', '').replace('/', '.').replace(/-./, (match) => match.substr(1).toUpperCase());
    }

    private async buildAsync(config: any) {
        if (!this.rollupTask)
            this.setRollupTask();
        let bundle = await this.rollupTask;
        return await bundle.write(config);
    }
}
