//import alias from 'rollup-plugin-alias';
//import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  entry: './__artifacts/build/entrypoint/dev/sample-web/devops/web.dev.entrypoint.js',
  dest: './__artifacts/serve/web.dev.entrypoint.umd.js',
  format: 'umd',
  moduleName: 'sharpangles.sample-app',
  sourceMap: true,
  onwarn: function (warning) { if (warning.code !== 'THIS_IS_UNDEFINED') console.error(warning.message); },
  external: [
    '@angular/core',
    '@angular/core/testing',
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
    '@angular/core/testing': 'ng.core.testing',
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
  //plugins: [
    //alias({
    //  '@sharpangles': '../..'
    //}),
    //sourcemaps()
  //]
}
