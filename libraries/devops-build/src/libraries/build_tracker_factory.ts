import { Tracker } from '../tracking/tracker';
import { RollupTracker } from '../rollup/rollup_tracker';
import { RollupConfig } from '../rollup/rollup_compiler';
import { TypescriptTrackerFactory, TypescriptTrackerFactoryOptions } from '../typescript/typescript_tracker_factory';
import { TrackerContext } from '../tracking/tracker_context';
import { TrackerFactory } from '../tracking/tracker_factory';
import * as path from 'path';

export interface BuildTrackerFactoryOptions {
    name: string;
    watch?: boolean;
    entryFile: string;
    workPath: string;
    outputPath: string;
}

export class BuildTrackerFactory extends TrackerFactory<BuildTrackerFactoryOptions> {
    constructor(trackerContext: TrackerContext, config: BuildTrackerFactoryOptions, private cwd?: string) {
        super(trackerContext, BuildTrackerFactory.ensureConfig(config));
    }

    static private ensureConfig(config: BuildTrackerFactoryOptions): BuildTrackerFactoryOptions {
        if (!config.workPath)
            config.workPath = './__artifacts/build';
        if (!config.workPath)
            config.workPath = './__artifacts/release';
        return config;
    }

    typescriptTrackerFactory: TypescriptTrackerFactory;
    rollupTracker: RollupTracker;
    // artifactBuilder

    createRollupConfig(config: BuildTrackerFactoryOptions) {
        return <RollupConfig>{
            name: config.name,
            supportNode: false,
            input: path.join(config.workPath, config.entryFile),
            outputPath: config.outputPath,
            outputUmd: true,
            outputEs: true
        };
    }

    createTypescriptConfig(config: BuildTrackerFactoryOptions) {
        return <TypescriptTrackerFactoryOptions>{
            tsConfig: {
                compilerOptions: {
                    noImplicitReturns: true,
                    noImplicitThis: true,
                    noUnusedLocals: true,
                    noEmitOnError: false,
                    noImplicitAny: true,
                    strictNullChecks: true,
                    baseUrl: '.',
                    module: 'es2015',
                    outDir: config.outputPath,
                    declaration: true,
                    stripInternal: true,
                    emitDecoratorMetadata: true,
                    experimentalDecorators: true,
                    moduleResolution: 'node',
                    rootDir: '.',
                    lib: ['es2015', 'dom'],
                    target: 'es2015',
                    skipLibCheck: true,
                    importHelpers: true,
                    types: [
                        'node',
                        'jasmine',
                        'systemjs'
                    ],
                    paths: paths // @todo create a tracker that can override json..in particular one that can connect the packagejson tracker and discover deps for setting paths.
                },
                include: [config.entryFile]
            },
            watchConfig: false,
            incremental: config.watch
        };
    }

    protected async onCreateChildFactoriesAsync(): Promise<TrackerFactory[]> {
        this.typescriptTrackerFactory = new TypescriptTrackerFactory(this.trackerContext, this.config.typescriptOptions, this.cwd);
        return [this.typescriptTrackerFactory];
    }

    protected async onCreateTrackersAsync(): Promise<Tracker[]> {
        this.rollupTracker = new RollupTracker(this.cwd);
        return [this.rollupTracker];
    }
}
