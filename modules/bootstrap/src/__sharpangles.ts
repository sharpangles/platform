namespace __sharpangles {
    /** Simple path combiner to avoid other platform-specific dependencies. */

    // export function hackXHRForDynamicAngular() {
    //     (function (open: any) {
    //         XMLHttpRequest.prototype.open = function (this: any, method: any, url: any, async: any, user: any, pass: any) {
    //             if (url && url.indexOf("/node_modules/") < 0 && url.indexOf("/@scopegoeshere/") >= 0 && (url.endsWith(".css") || url.endsWith(".html")))
    //                 url = url.replace("/@scopegoeshere/", "/node_modules/@scopegoeshere/");
    //             open.call(this, method, url, async, user, pass);
    //         };
    //     })(XMLHttpRequest.prototype.open);
    // }
}
