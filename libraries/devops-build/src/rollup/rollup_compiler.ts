import * as rollup from 'rollup';
import * as sourcemapsProxy from 'rollup-plugin-sourcemaps';
import * as path from 'path';
import * as nodeResolveProxy from 'rollup-plugin-node-resolve';
// import * as builtinsProxy from 'rollup-plugin-node-builtins';
import * as globalsProxy from 'rollup-plugin-node-globals';
import * as commonjsProxy from 'rollup-plugin-commonjs';

const sourcemaps: any = (<any>sourcemapsProxy).default || sourcemapsProxy; // https://github.com/rollup/rollup/issues/1267
const nodeResolve: any = (<any>nodeResolveProxy).default || nodeResolveProxy; // https://github.com/rollup/rollup/issues/1267
// const builtins: any = (<any>builtinsProxy).default || builtinsProxy; // https://github.com/rollup/rollup/issues/1267
const globals: any = (<any>globalsProxy).default || globalsProxy; // https://github.com/rollup/rollup/issues/1267
const commonjs: any = (<any>commonjsProxy).default || commonjsProxy; // https://github.com/rollup/rollup/issues/1267


export interface RollupConfig {
    /** The package name of this library.  Used to generate umd global name and output file names. */
    name: string;
    supportNode?: boolean;
    input: string;
    outputPath: string;

    outputUmd: boolean;
    outputEs: boolean;
}

export function rxjsGlobalNameFactory(id: string) {
    if (!id.startsWith('rxjs/'))
        return;
    if (id.startsWith('rxjs/add/operator'))
        return 'Rx.Observable.prototype';
    if (id.startsWith('rxjs/add/observable'))
        return 'Rx.Observable';
    return 'Rx';
}

export function angularGlobalNameFactory(id: string) {
    if (!id.startsWith('@angular/'))
        return;
    return id.replace('@angular/', 'ng.');
}

/**
 * There is also rollup-watch, but we want control over the trigger.
 */
export class RollupCompiler {
    /**
     * @param globalNameFactories An optional array of functions to produce a global name for libraries that don't fix the assumed standard
     */
    constructor(public config: RollupConfig, globalNameFactories?: [(id: string) => string | undefined], private cwd?: string) {
        this.globalNameFactories = globalNameFactories || [rxjsGlobalNameFactory, angularGlobalNameFactory];
    }

    private globalNameFactories?: [(id: string) => string | undefined];

    async rollupAsync() {
        let plugins = this.config.supportNode ? [/*builtins(), */globals(), nodeResolve(), commonjs()] : [];
        plugins.push(sourcemaps());
        let config = {
            cache: this.cache, // The rollup call is consistent, so it doesnt matter if we contend over this value.
            entry: path.resolve(this.cwd || process.cwd(), this.config.input),
            plugins: plugins,
                // {
                //     // Assumes any remaining scoped package is a local neighbor.
                //     resolveId: (importee, importer) => {
                //         if (!importee.startsWith('@'))
                //             return;
                //         return path.resolve(this.cwd, importee.substr(importee.indexOf('/') + 1), this.localBuildRoot);
                //     }
                // },
            external: function (id) {
                return !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\\') && !path.isAbsolute(id) ? id : null;
            },
        };
        let bundle = await rollup.rollup(config);
        if (this.config.outputEs)
            await this.buildEsAsync(bundle);
        if (this.config.outputUmd)
            await this.buildUmdAsync(bundle);
    }

    private cache?: any;

    private async buildUmdAsync(bundle: any) {
        return await bundle.write({
            dest: this.getDest('umd'),
            format: 'umd',
            sourceMap: true,
            moduleName: `${this.getGlobalName(this.config.name)}`,
            globals: id => {
                if (this.globalNameFactories) {
                    for (let factory of this.globalNameFactories) {
                        let result = factory(id);
                        if (result)
                            return result;
                    }
                }
                if (!id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\\') && !path.isAbsolute(id))
                    return this.getGlobalName(id);
                return;
            }
        });
    }

    private async buildEsAsync(bundle: any) {
        return await bundle.write({
            dest: this.getDest('es'),
            format: 'es',
            sourceMap: true
        });
    }

    private getDest(ext: string) {
        return `${this.cwd}/${this.config.outputPath}/${this.config.name.startsWith('@') ? this.config.name.substr(this.config.name.indexOf('/') + 1) : this.config.name }.${ext}.js`;
    }

    private getGlobalName(name: string) {
        return name.replace('@', '').replace('/', '.').replace(/-./, (match) => match.substr(1).toUpperCase());
    }
}
