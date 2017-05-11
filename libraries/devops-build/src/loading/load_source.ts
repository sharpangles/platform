export interface LoadProgress {
    position: number;
    length: number;
}

export interface LoadSource<TData = any> {
    readAsync(onData: (progress: LoadProgress) => any): Promise<TData | undefined>;
    dispose(): void;
    data?: TData;
}
