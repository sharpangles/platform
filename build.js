const path = require('path');
const spawn = require('child_process').spawn;
var isWin = /^win/.test(process.platform);

function runNPM() {
    console.log("Running NPM for devops");
    const npmInstallProc = spawn(isWin ? 'npm.cmd' : 'npm', ['install'], { cwd: __dirname });
    npmInstallProc.on('error', err => { throw err; });
    return new Promise(resolve => npmInstallProc.on('close', code => resolve()));
}

function runTSC() {
    console.log("Running TSC for devops");
    const tscProc = spawn(isWin ? 'tsc.cmd' : 'tsc', ['-p', '../../modules/devops/tsconfig.json'], { cwd: path.resolve(__dirname, 'node_modules/.bin') });
    tscProc.stdout.on('data', data => console.log(data.toString()));
    tscProc.stderr.on('data', data => console.log(data.toString()));
    tscProc.on('error', err => { throw err; });
    return new Promise(resolve => tscProc.on('close', code => resolve()));
}

function runBuild() {
    console.log("Running devops");
    const BuildSequence = require('./modules/devops/dist/build-sequence').BuildSequence;
    new BuildSequence(path.resolve(__dirname, './')).runAsync().then(succeeded => {
        console.log(succeeded ? '*** Build Succeeded ***' : '*** Build Failed ***');
        if (!succeeded)
            process.exit(1);
    });
}

runNPM().then(() => runTSC().then(() => runBuild()));
