import { CommandActivity } from './command-activity';
import { Log } from '../log';
import * as path from 'path';

export class DotnetBuildAllActivity extends CommandActivity {
    constructor(root: string, solutionFile: string, log?: Log) {
        super('dotnet', ['build', solutionFile], path.resolve(root, './CSharp'), log);
    }
}
