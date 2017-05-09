import { LoadSource, LoadProgress } from '../loading/load_source';

export abstract class WrappedLoadSource<TOriginal, TData> implements LoadSource<TData> {
    constructor(public wrapped: LoadSource<TOriginal>) {
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

    abstract convert(original: TOriginal): TData;

    dispose() {
        this.wrapped.dispose();
    }

    data: TData;
    get progress(): LoadProgress {
        return this.wrapped.progress;
    }
}
