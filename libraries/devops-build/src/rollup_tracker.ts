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
export class RollupTracker {
    constructor(public scope: string, public name: string, private _localBuildRoot = './__artifacts/build/index.js', private _localReleaseRoot = './__artifacts/release/bundles', cwd?: string) {
        this._cwd = cwd || process.cwd();
    }

    private _cwd: string;

    reset() {
        delete this._cache;
        delete this._rollupTask;
    }

    async rollupAsync() {
        try {
            this._setRollupTask();
            await Promise.all([this.buildUmdAsync(), this.buildEsAsync()]);
        }
        catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    private async _setRollupTask() {
        let config = {
            cache: this._cache, // The rollup call is consistent, so it doesnt matter if we contend over this value.
            entry: path.resolve(this._cwd, this._localBuildRoot),
            plugins: [
                nodeResolve(),
                {
                    // Assumes any remaining scoped package is a local neighbor.
                    resolveId: (importee, importer) => {
                        if (!importee.startsWith('@'))
                            return;
                        return path.resolve(this._cwd, importee.substr(importee.indexOf('/') + 1), this._localBuildRoot);
                    }
                },
                sourcemaps(),
                builtins()
            ],
            external: function (id) {
                return !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\\') && !path.isAbsolute(id) ? id : null;
            },
        };
        this._rollupTask = rollup.rollup(config);
        await this._rollupTask;
    }

    private _cache?: any;
    private _rollupTask: Promise<any>;

    async buildUmdAsync() {
        this._buildAsync({
            dest: `${this._cwd}/${this._localReleaseRoot}/${this.name}.umd.js`,
            format: 'umd',
            sourceMap: true,
            moduleName: `${this.scope}.${this._getGlobalName(this.name)}`,
            globals: function (id) {
                if (id.startsWith('@'))
                    return this._getGlobalName(id);
                if (id.startsWith('rxjs/add/'))
                    return 'Rx.Observable.prototype';
                if (id.startsWith('rxjs/'))
                    return 'Rx';
                if (id === 'tslib')
                    return 'tslib';
            }
        });
    }

    async buildEsAsync() {
        this._buildAsync({
            dest: `${this._cwd}/${this._localReleaseRoot}/${this.name}.es.js`,
            format: 'es',
            sourceMap: true
        });
    }

    private _getGlobalName(name: string) {
        return name.replace('@angular/', 'ng.').replace('@', '').replace('/', '.').replace(/-./, (match) => match.substr(1).toUpperCase());
    }

    private async _buildAsync(config: any) {
        if (!this._rollupTask)
            return; // It was reset
        let bundle = await this._rollupTask;
        return await bundle.write(config);
    }
}
