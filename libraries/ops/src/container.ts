// import { Remover, Removable } from './removable';
// import { ConnectionResult } from './connectable';
// import { Arranger } from './arranger';
// import { MessageValidation, CancellationToken, CancellationTokenSource, Disposable } from '@sharpangles/lang';
// import { Observable } from 'rxjs/Observable';
// import { Subject } from 'rxjs/Subject';

// @Disposable()
// export abstract class Container<TRemovable extends Removable> extends Remover {
//     private childAddedSubject = new Subject<TRemovable>();
//     get childAdded(): Observable<TRemovable> { return this.childAddedSubject; }
//     private childRemovedSubject = new Subject<TRemovable>();
//     get childRemoved(): Observable<TRemovable> { return this.childRemovedSubject; }

//     protected childSet = new Set<TRemovable>();
//     get children(): Iterable<Removable> { return this.childSet; }

//     /** A list of arrangers that require this tracker */
//     get arrangers(): Iterable<Arranger> { return this.arrangerSet; }
//     protected arrangerSet = new Set<Arranger>();

//     registerArranger(arranger: Arranger) {
//         this.arrangerSet.add(arranger);
//     }

//     protected canRemoveAfterUnregistering(arranger: Arranger) {
//         return this.arrangerSet.size <= 1;
//     }

//     async unregisterArrangerAsync(arranger: Arranger, cancellationToken: CancellationToken): Promise<ConnectionResult> {
//         if (this.canRemoveAfterUnregistering(arranger))
//             return <ConnectionResult>{ validation: { isValid: true } };
//         let result = await this.removeAsync(cancellationToken);
//         return <ConnectionResult>{
//             validation: result.validation,
//             canCommit: () => result.canCommit && result.canCommit(),
//             commit: () => {
//                 result.commit && result.commit();
//                 this.arrangerSet.delete(arranger);
//             },
//             rollback: result.rollback
//         };
//     }

//     async addChildAsync(child: TRemovable, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
//         if (this.childSet.has(child))
//             return <ConnectionResult>{ validation: new MessageValidation('Child already present.') };
//         cancellationToken = CancellationTokenSource.createLinkedTokenSource(this.cancellationTokenSource.token, cancellationToken).token;
//         return <ConnectionResult>{
//             validation: { isValid: true },
//             canCommit: () => {
//                 if (cancellationToken && cancellationToken.isCancellationRequested || !this.childSet.has(child))
//                     return false;
//                 return true;
//             },
//             commit: () => this.commitAddChild(child),
//             rollback: () => this.rollbackAddChild(child)
//         };
//     }

//     protected rollbackAddChild(child: TRemovable) {
//         this.childAddedSubject.error(new MessageValidation('Add child was rolled back.'));
//     }

//     protected commitAddChild(child: TRemovable) {
//         this.childSet.add(child);
//         this.childAddedSubject.next(child);
//     }

//     async removeChildAsync(child: TRemovable, cancellationToken?: CancellationToken): Promise<ConnectionResult> {
//         if (this.childSet.has(child))
//             return <ConnectionResult>{ validation: new MessageValidation('Child already present.') };
//         cancellationToken = CancellationTokenSource.createLinkedTokenSource(this.cancellationTokenSource.token, cancellationToken).token;
//         return <ConnectionResult>{
//             validation: { isValid: true },
//             canCommit: () => {
//                 if (cancellationToken && cancellationToken.isCancellationRequested || this.childSet.has(child))
//                     return false;
//                 return true;
//             },
//             commit: () => this.commitRemoveChild(child),
//             rollback: () => this.rollbackRemoveChild(child)
//         };
//     }

//     protected rollbackRemoveChild(child: TRemovable) {
//         this.childRemovedSubject.error(new MessageValidation('Add child was rolled back.'));
//     }

//     protected commitRemoveChild(child: TRemovable) {
//         this.childSet.delete(child);
//         this.childRemovedSubject.next(child);
//     }

//     protected commitRemoval(removalResults: ConnectionResult[]) {
//         super.commitRemoval(removalResults);
//         this.childAddedSubject.complete();
//         this.childRemovedSubject.complete();
//     }
// }
