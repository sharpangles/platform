let RollupContext = require('./__artifacts/local/src/rollup_context').RollupContext;
let rollupContext = new RollupContext('@sharpangles', 'devops-build');
Promise.all([
    rollupContext.buildUmdAsync(),
    rollupContext.buildEsAsync()
]);
