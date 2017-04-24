let deps: any = {};

let baseNgPackages = ['core', 'common', 'animations', 'animations/browser', 'compiler', 'forms', 'http', 'router', 'platform-browser', 'platform-browser/animations', 'platform-browser-dynamic', 'platform-webworker', 'platform-webworker-dynamic'];
baseNgPackages.forEach(pkg => {
    deps.dev[`@angular/${pkg}`] = {
        defaultExtension: false,
        systemConfig: {
            map: {}
        }
    };
    deps.dev[`@angular/${pkg}`].systemConfig.map[`@angular/${pkg}`] = `npm:@angular/${pkg.indexOf('/') >= 0 ? pkg.substr(0, pkg.indexOf('/')) : pkg}/bundles/${pkg.replace('/', '-')}.umd.js`;
});
// var testNgPackages = ["core/testing", "animations/browser/testing", "http/testing", "compiler/testing", "platform-browser/testing", "platform-browser-dynamic/testing"]
// baseNgPackages.concat(testNgPackages).forEach(pkg => {
//     deps.test[`@angular/${pkg}`] = {
//         defaultExtension: false,
//         systemConfig: {
//             map: {}
//         }
//     };
//     deps.test[`@angular/${pkg}`].systemConfig.map[`@angular/${pkg}`] = `npm:@angular/${pkg.indexOf('/') >= 0 ? pkg.substr(0, pkg.indexOf('/')) : pkg}/bundles/${pkg.replace('/', '-')}.umd.js`
// });

export default deps;
