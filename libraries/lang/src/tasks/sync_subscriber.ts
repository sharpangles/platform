/**
 * Provides a means for imperative operations to participate in distributed transactions.
 * Concepts:
 * - https://en.wikipedia.org/wiki/Two-phase_locking
 * - https://en.wikipedia.org/wiki/Two-phase_commit_protocol
 */
export interface SyncSubscriber {
    rollback?: () => Promise<void> | void;
    rolledBack?: () => void;
    vote?: () => Promise<boolean> | boolean;
    commit?: () => Promise<void> | void;
    committed?: () => void;
}
