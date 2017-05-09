import { LoadSource, LoadProgress } from '../loading/load_source';

export class WrappedLoadSource<TOriginal, TData> implements LoadSource<TData> {
    constructor(public wrapped: LoadSource<TOriginal>, private converter?: (original: TOriginal) => TData) {
    }

    openAsync() {
        return this.wrapped.openAsync();
    }

    closeAsync() {
        return this.wrapped.closeAsync();
    }

    async readNextAsync() {
        if (await this.wrapped.readNextAsync())
            return true;
        this.data = this.convert(this.wrapped.data);
        return false;
    }

    convert(original: TOriginal): TData {
        if (!this.converter)
            throw new Error('Not implemented');
        return this.converter(original);
    }

    dispose() {
        this.wrapped.dispose();
    }

    data: TData;
    get progress(): LoadProgress {
        return this.wrapped.progress;
    }
}
