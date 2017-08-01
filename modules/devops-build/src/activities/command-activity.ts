import { Activity } from '../activity';
import { Log, LogEntryType } from '../log';
import * as split2 from 'split2';
import * as path from 'path';
import { Transform } from 'stream';

class BackspaceConverter extends Transform {
    constructor(options?: any) {
        super(options);
    }

    _transform(chunk: any, encoding: string, callback: Function): void {
        if (Buffer.isBuffer(chunk)) {
            for (let i = 0; i < chunk.length; i++) {
                if (chunk[i] === 8)
                    chunk[i] = 10;
            }
            callback(null, chunk);
            return;
        }
        let str = '';
        for (let i = 0; i < chunk.length; i++)
            str += chunk[i] === String.fromCharCode(8) ? '\n' : chunk[i];
        callback(null, str);
    }
}

export class CommandActivity extends Activity {
    constructor(public command: string, public args: string[], public cwd: string, log?: Log) {
        super(log);
    }

    protected succeeding = true;

    onRunAsync() {
        const spawn = require('child_process').spawn;
        const proc = spawn(this.command, this.args, { cwd: this.cwd });

        proc.stdout.pipe(new BackspaceConverter()).pipe(split2()).on('data', data => this.logOutput(data));
        proc.stderr.pipe(new BackspaceConverter()).pipe(split2()).on('data', data => this.logError(data));

        proc.on('error', err => {
            this.log.log(`error: ${err}`, LogEntryType.Critical);
        });

        return new Promise<boolean>((resolve, reject) => proc.on('close', code => {
            try {
                this.onCode(code);
                resolve(this.succeeding);
            } catch (err) {
                reject(err);
            }
        }));
    }

    protected logOutput(data: any) {
        this.log.log(data);
    }

    protected logError(data: any) {
        this.log.log(data, LogEntryType.Error);
        this.succeeding = false;
    }

    protected onCode(code) {
        if (code !== 0)
            this.logError(`Exit code was ${code}.`);
    }

    toString() {
        return `${this.command}${this.args && this.args.length > 0 ? ' ' + this.args[0] : ''} in ${path.basename(this.cwd)}`;
    }
}
