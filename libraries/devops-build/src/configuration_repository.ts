import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as locker from 'proper-lockfile';
import * as extend from 'deep-extend';

export abstract class ConfigurationRepository {
    abstract loadAsync(): Promise<any>;
    abstract saveAsync(): Promise<any>;
    abstract modifyAsync(modify: (config: any) => Promise<any>): Promise<any>;
}

export abstract class FileConfigurationRepository {
    protected static defaultFileName = 'sharpangles.config.json';

    protected abstract getFileName(): string | undefined;

    private async runAsync(task: () => Promise<any>) {
        let release = await new Promise<Function>((resolve, reject) => locker.lock(this.getFileName(), (err, data) => err ? reject(err) : resolve(data)));
        try {
            return await task();
        }
        finally {
            release();
        }
    }

    private async readAsync() {
        let filename = this.getFileName();
        if (!filename || !await new Promise((resolve, reject) => fs.exists(<string>filename, exists => resolve(exists))))
            return {};
        return await new Promise((resolve, reject) => fs.readFile(<string>filename, 'utf8', (err, data) => err ? reject(err) : resolve(data)));
    }

    private writeAsync(data: any) {
        let filename = this.getFileName();
        if (!filename)
            throw new Error('No filename');
        return new Promise((resolve, reject) => fs.writeFile(<string>filename, data, err => err ? reject(err) : resolve()));
    }

    loadAsync() {
        return this.runAsync(() => this.readAsync());
    }

    saveAsync(data: any) {
        return this.runAsync(() => this.writeAsync(data));
    }

    modifyAsync(modify: (config: any) => Promise<any>) {
        return this.runAsync(async () => {
            let config = await this.readAsync();
            config = await modify(config);
            await this.writeAsync(config);
        });
    }
}

export class TempConfigurationRepository extends FileConfigurationRepository {
    protected getFileName() {
        return path.resolve(os.tmpdir(), FileConfigurationRepository.defaultFileName);
    }
}

export class EnvironmentConfigurationRepository extends FileConfigurationRepository {
    protected getFileName(): string | undefined {
        let environmentDir = process.env.SHARPANGLES;
        if (!environmentDir)
            return path.resolve(process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local'), `sharpangles/${FileConfigurationRepository.defaultFileName}`);
        return path.resolve(environmentDir, FileConfigurationRepository.defaultFileName);
    }
}

export class LocalConfigurationRepository extends FileConfigurationRepository {
    protected getFileName() {
        return FileConfigurationRepository.defaultFileName;
    }
}

export class CompositeConfigurationRepository {
    constructor(private repositories: ConfigurationRepository[]) {
    }

    async loadAsync(): Promise<any> {
        let result: any = {};
        let configs = await Promise.all(this.repositories.map(r => r.loadAsync()));
        return extend(result, ...configs);
    }

    saveAsync(): Promise<any> {
        throw new Error('Read only');
    }

    modifyAsync(modify: (config: any) => Promise<any>): Promise<any> {
        throw new Error('Read only');
    }
}

// @todo Sharable remote storage
