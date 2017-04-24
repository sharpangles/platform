/// <reference path="./dependency_loader.ts" />
/// <reference path="./dependency_resolver.ts" />
/// <reference path="./polyfiller.ts" />

namespace __sharpangles {
    /**
     * Base class for pluggable entry point features.
     */
    export class Feature {
        /**
         * @param dependencies Compile-time dependencies.
         */
        constructor(public dependencies?: Feature[]) {
        }

        protected entryPoint: EntryPoint<any>;

        /**
         * Allows runtime-checking to add dependencies.
         */
        dependsOn(feature: Feature) {
            return false;
        }

        /** Called after the module loader is created before creating the polyfiller. */
        protected onModuleLoaderCreatedAsync(entryPoint: EntryPoint<any>) { return Promise.resolve(); }
        /** @internal */
        moduleLoaderCreatedAsync(entryPoint: EntryPoint<any>): Task<void> {
            return this._ensureTask(entryPoint, f => f === this ? f._moduleLoaderCreatedTask : f.moduleLoaderCreatedAsync(entryPoint), task => this._moduleLoaderCreatedTask = task, () => this.onModuleLoaderCreatedAsync(entryPoint));
        }
        private _moduleLoaderCreatedTask: Task<void>;

        /** Called after the module loader is created before creating the polyfiller. */
        protected onPolyfillerCreatedAsync(entryPoint: EntryPoint<any>) { return Promise.resolve(); }
        /** @internal */
        polyfillerCreatedAsync(entryPoint: EntryPoint<any>): Task<void> {
            return this._ensureTask(entryPoint, f => f === this ? f._polyfillerCreatedTask : f.polyfillerCreatedAsync(entryPoint), task => this._polyfillerCreatedTask = task, () => this.onPolyfillerCreatedAsync(entryPoint));
        }
        private _polyfillerCreatedTask: Task<void>;

        /** Called after the module loader is created before creating the polyfiller. */
        protected onBootstrappedAsync(entryPoint: EntryPoint<any>) { return Promise.resolve(); }
        /** @internal */
        bootstrappedAsync(entryPoint: EntryPoint<any>): Task<void> {
            return this._ensureTask(entryPoint, f => f === this ? f._bootstrappedTask : f.bootstrappedAsync(entryPoint), task => this._bootstrappedTask = task, () => this.onBootstrappedAsync(entryPoint));
        }
        private _bootstrappedTask: Task<void>;

        /** Called after the module loader is created before creating the polyfiller. */
        protected onStartedAsync(entryPoint: EntryPoint<any>) { return Promise.resolve(); }
        /** @internal */
        startedAsync(entryPoint: EntryPoint<any>): Task<void> {
            return this._ensureTask(entryPoint, f => f === this ? f._startedTask : f.startedAsync(entryPoint), task => this._startedTask = task, () => this.onStartedAsync(entryPoint));
        }
        private _startedTask: Task<void>;

        private _ensureTask(entryPoint: EntryPoint<any>, getTask: (feature: Feature) => Task<void>, setTask: (task: Task<void>) => void, onEvent: () => Promise<void>) {
            if (!getTask(this)) {
                setTask(new Task<void>(async () => {
                    if (this.dependencies)
                        await Promise.all(this.dependencies.map(d => getTask(d)));
                    await onEvent();
                }, undefined, true));
            }
            return getTask(this);
        }
    }
}
