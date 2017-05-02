/**
 * The typescript polyfill, tslib, has its own custom 'umd' build, but in the global space it sets everything on global directly.
 * To use tslib as a global 'import' with consumer umd libraries (built with importHelpers) we need it on a global module named 'tslib'.
 * This rollup build accomplishes that by using the es6 distribution to output umd.
 */
export default {
  entry: '../../node_modules/tslib/tslib.es6.js',
  dest: './__artifacts/release/bundles/tslib.umd.js',
  format: 'umd',
  moduleName: 'tslib',
  onwarn: function (warning) { if (warning.code !== 'THIS_IS_UNDEFINED') console.error(warning.message); },
  external: [
    '@angular/core',
    '@angular/common',
    '@angular/forms',
    '@angular/http',
    '@angular/platform-browser-dynamic',
    '@angular/platform-browser/animations',
    '@angular/platform-webworker',
    'rxjs/Observable',
    'rxjs/AsyncSubject',
    'rxjs/add/operator/publishLast',
    'rxjs/add/operator/map',
    'rxjs/add/operator/toPromise',
    'tslib'
  ],
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/forms': 'ng.forms',
    '@angular/http': 'ng.http',
    '@angular/platform-browser-dynamic': 'ng.platform-browser-dynamic',
    '@angular/platform-browser/animations': 'ng.platform-browser.animations',
    '@angular/platform-webworker': 'ng.platform-webworker',
    '@angular/http': 'ng.http',
    'rxjs/Observable': 'Rx',
    'rxjs/AsyncSubject': 'Rx',
    'rxjs/add/operator/publishLast': 'Rx.Observable.prototype',
    'rxjs/add/operator/map': 'Rx.Observable.prototype',
    'rxjs/add/operator/toPromise': 'Rx.Observable.prototype',
    'tslib': 'tslib'
  }
}
