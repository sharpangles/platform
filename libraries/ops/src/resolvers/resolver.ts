/**
 * Should be like dependency injection, where we resolve services (trackers) in a scope (tracker context)
 * Sort of a blend of ng (singleton scopes) and dotnet DI (structured lifetime management), all with json config passed during resolution.
 * Resolver should be stored with tracker context, allowing scoped variation in repo source.
 */
export class Resolver {
    resolveAsync(wellKnownTrackerFactoryName: string, factoryConfig: any): Promise<TrackerFactory> {
    }
}
