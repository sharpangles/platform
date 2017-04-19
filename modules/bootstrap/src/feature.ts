namespace __sharpangles {
    export interface FeatureBootstrapper {
        (module: any, features: { [name: string]: Feature }): Promise<any>;
    }

    export interface ModuleBootstrapper {
        (features: { [name: string]: Feature }): Promise<any>;
    }

    export interface Feature {
        /**
         * If no __sharpanglesBootstrap is found on the app that was run, the self-named or provided bootstrapping feature will be used.
         */
        __sharpanglesBootstrap?: FeatureBootstrapper;
        dependencies: { [key: string]: Feature };
    }
}
