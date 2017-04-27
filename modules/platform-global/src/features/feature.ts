import { EntryPoint } from '../entry_point';

/**
 * Base class for pluggable entry point features.
 */
export class Feature {
    dependencies: Feature[];

    /**
     * Allows runtime-checking to add dependencies.
     */
    dependsOn(feature: Feature) {
        return false;
    }

    protected async onInitAsync(entryPoint: EntryPoint) {
        if (!this.dependencies)
            return;
        await Promise.all(this.dependencies.map(d => d.initAsync(entryPoint)));
    }

    private _initTask?: Promise<void>;
    async initAsync(entryPoint: EntryPoint) {
        if (!this._initTask) {
            this._initTask = this.onInitAsync(entryPoint);
        }
        return this._initTask;
    }

    protected async onModifiedAsync(entryPoint: EntryPoint) {
        if (!this.dependencies)
            return;
        await Promise.all(this.dependencies.map(d => d.modifiedAsync(entryPoint)));
    }

    private _modifiedTask?: Promise<void>;
    async modifiedAsync(entryPoint: EntryPoint) {
        if (!this._initTask) {
            await this.initAsync(entryPoint);
            await this.runAsync(entryPoint);
        }
        else if (!this._modifiedTask) {
            this._modifiedTask = this.onModifiedAsync(entryPoint);
            await this._modifiedTask;
        }
    }

    protected async onRunAsync(entryPoint: EntryPoint) {
        if (!this.dependencies)
            return;
        await Promise.all(this.dependencies.map(d => d.runAsync(entryPoint)));
    }

    private _runTask?: Promise<void>;
    async runAsync(entryPoint: EntryPoint) {
        if (!this._runTask)
            this._runTask = this.onRunAsync(entryPoint);
        return this._runTask;
    }

    /** @internal */
    addDependency(child: Feature): boolean {
        if (!this.dependencies)
            this.dependencies = [child];
        else if (this.dependencies.indexOf(child) < 0)
            this.dependencies.push(child);
        return true;
    }
}
