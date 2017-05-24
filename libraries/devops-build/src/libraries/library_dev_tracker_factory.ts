import { PackageJsonTrackerFactory } from '../typescript/packagejson_tracker_factory';
import { Connections } from '../tracking/connections/connections';
import { RollupTracker } from '../rollup/rollup_tracker';
import { RollupConfig } from '../rollup/rollup_compiler';
import { TypescriptTrackerFactory, TypescriptTrackerFactoryOptions } from '../typescript/typescript_tracker_factory';
import { Tracker } from '../tracking/tracker';
import { FactoryConfig } from '../tracking/tracker_factory_loader';
import { TrackerContext } from '../tracking/tracker_context';
import { TrackerFactory } from '../tracking/tracker_factory';

export interface BuildProfile {
    name: string;
    typescriptOptions?: TypescriptTrackerFactoryOptions;
}

export interface LibraryDevTrackerFactoryOptions {
    buildProfiles: BuildProfile[];

    /** Name of one of the provided build profiles to use as a rollup source */
    rollupProfile?: string;
    rollupConfig?: RollupConfig;
}

export function getDefaultBuildProfiles() {
    return [
        {
            name: 'Dev Entrypoint',
            typescriptOptions: {}
        }
    ];
}

export class LibraryDevTrackerFactory extends TrackerFactory<LibraryDevTrackerFactoryOptions> {
    constructor(protected trackerContext: TrackerContext, public config: LibraryDevTrackerFactoryOptions, private cwd?: string) {
        super(trackerContext, config);
    }

    typescriptFactories: TypescriptTrackerFactory[];
    packageJsonWatcher?: PackageJsonTrackerFactory;

    protected async onCreateTrackersAsync(): Promise<Tracker[]> {
        if (!this.config)
            throw new Error('No config provided.');
        let config = this.config;
        this.typescriptFactories = config.buildProfiles.map(p => new TypescriptTrackerFactory(this.trackerContext, <FactoryConfig<TypescriptTrackerFactoryOptions>>{ name: p.name, type: TypescriptTrackerFactory.factoryName, config: p.typescriptOptions }, this.cwd));
        await this.trackerContext.createFactoriesAsync(this.typescriptFactories);
        if (!config.rollupProfile)
            return [];
        let rollupProfile = this.typescriptFactories.find(f => f.config.name === config.rollupProfile);
        if (!rollupProfile)
            throw new Error('Rollup profile not found.');
        let rollupTracker = new RollupTracker(this.cwd);



        if (rollupProfile.tsConfigLoader) {
            Connections.configOnProgress(rollupProfile.tsConfigLoader, rollupTracker, { name: 'Rollup source from tsconfig' }, result => this.getRollupConfig({ input: result.progress.options.outDir }));
        }



        await rollupTracker.configureAsync(config.rollupConfig || {
            name: rollupProfile.config.name || 'sharpangleslib',
            input: `./__artifacts/${rollupProfile.config.name}/index.js`,
            outputPath: './__artifacts/release/bundles',
            outputUmd: true,
            outputEs: true
        });
        await Connections.runOnSuccess(this.tsConfigLoader, this.typescriptWatcherTracker, { name: 'TS files watcher config', description: 'Resets the .ts files watcher due to a config change' }, load => <WatcherConfig>{ cwd: this.cwd, patterns: load.result.fileNames, idleTime: config && config.tsConfigIdleTime }).connectAsync();
        return [rollupTracker];
    }

    start(): void {
    }

    getRollupConfig(config: any): RollupConfig {

    }
}
    // constructor(public config: RollupConfig, public name: string, private localBuildRoot = './__artifacts/build/index.js', private localReleaseRoot = './__artifacts/release/bundles', private cwd?: string) {
