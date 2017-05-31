import { Observable } from 'rxjs/Observable';

export interface LoadProgress {
    position: number;
    length: number;
}

export interface LoadSource<TData = any> {
    progressed(): Observable<LoadProgress>;
    readAsync(onData: (progress: LoadProgress) => any): Promise<TData | undefined>;
    dispose(): void;
    data?: TData;
}
