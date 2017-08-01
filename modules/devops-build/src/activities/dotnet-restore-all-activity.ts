import { CommandActivity } from './command-activity';
import { Log } from '../log';
import * as path from 'path';

export class DotnetRestoreAllActivity extends CommandActivity {
    constructor(root: string, solutionFile: string, log?: Log) {
        super('dotnet', ['restore', solutionFile], path.resolve(root, './CSharp'), log);
    }
}
