// import { Activity } from '../activity';
// import { Log } from '../log';
// import * as glob from 'glob';
// import { TestPublisher } from 'vsts-task-lib';
// import * as path from 'path';

// export class PublishTestResultsActivity extends Activity {
//     constructor(public root: string, log?: Log) {
//         super(log);
//     }

//     toString() { return 'Publish test results'; }

//     protected async onRunAsync(): Promise<boolean> {
//         const tsTestResults = glob.sync('./Typescript/modules/cli-proj/TestResults/*.xml', <any>{ absolute: true, cwd: path.resolve(this.root) });
//         if (tsTestResults.length !== 0)
//             new TestPublisher('JUnit').publish(tsTestResults, true, undefined, undefined, 'Typescript Tests', undefined);
//         const csharpTestResults = glob.sync('./CSharp/*/*/test/*/TestResults/*.trx', <any>{ absolute: true, cwd: path.resolve(this.root) });
//         if (csharpTestResults.length !== 0)
//             new TestPublisher('VSTest').publish(csharpTestResults, true, undefined, undefined, 'C# Tests', undefined);
//         return true;
//     }
// }
