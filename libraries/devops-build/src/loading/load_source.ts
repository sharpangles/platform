export interface LoadProgress {
    position: number;
    length: number;
}

export interface LoadSource<TData = any> {
    openAsync(): Promise<void>;
    closeAsync(): Promise<void>;
    readNextAsync(): Promise<boolean>;
    dispose(): void;

    data: TData;
    progress: LoadProgress;
}
