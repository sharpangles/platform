export default {
    'zone.js': {
        moduleLoaderConfig: {
            browserLoaderConfig: {
                src: '/node_modules/zone.js/dist/zone.js'
            }
        }
    },
    '@sharpangles/sample-dependency': {
        moduleLoaderConfig: {
            systemConfig: {
                bundles: {
                    'npm:@sharpangles/sample-dependency/bundles/sharpangles-sample-dependency.umd.js': [
                        '@sharpangles/sample-dependency',
                        '@sharpangles/sample-dependency/*',
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
