/**
 * This example configures a 'static' dependency, one we know about at compile time.
 * Since this is at a root app level, there isn't necessarily a need to do this.
 * We could simply have gone through our module loader itself and created a policy that skipped loading the root app dependencies.
 * It's provided here as a proof of concept.  Dependencies have the potential to provide other global-context configuration
 * (sandboxing, production reloading, etc...) and would be necessary in any dynamically loaded library project to provide
 * configuration to the unknown app on its own dependencies.
 */

export default {
    '@sharpangles/sample-dependency': {
        moduleLoaderConfig: {
            systemConfig: {
                bundles: {
                    'npm:@sharpangles/sample-dependency/__artifacts/release/bundles/sample-dependency.system.js': [
                        '@sharpangles/sample-dependency',
                        '@sharpangles/sample-dependency/*',
                        '@sharpangles/sample-dependency/build/*'
                    ]
                }
            },
            systemPackageConfig: {
                main: 'index',
                defaultExtension: false,
                format: 'system'
            }
        }
    }
};
