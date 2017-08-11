// import { CancellationToken } from './cancellation_token';

// export class CancellationTokenSource {
//     token = new CancellationToken(this);

//     /** @internal */
//     isCancellationRequested = false;

//     /** @internal */
//     registrations: (() => void)[];

//     cancel() {
//         this.isCancellationRequested = true;
//         for (let registration of this.registrations)
//             registration();
//     }

//     static createLinkedTokenSource(...tokens: (CancellationToken | undefined)[]): CancellationTokenSource {
//         tokens = tokens.filter(t => t);
//         if (tokens.length === 1)
//             return (<any>tokens[0]).cancellationTokenSource;
//         let cancellationTokenSource = new CancellationTokenSource();
//         let cancelled = false;
//         for (let token of <CancellationToken[]>tokens) {
//             token.register(() => {
//                 if (cancelled)
//                     return;
//                 cancellationTokenSource.cancel();
//                 cancelled = true;
//             });
//         }
//         return cancellationTokenSource;
//     }
// }
