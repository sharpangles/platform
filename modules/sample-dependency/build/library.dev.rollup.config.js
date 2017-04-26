export default {
  entry: './__artifacts/build/app/index.js',
  dest: './__artifacts/release/bundles/sample-dependency.umd.js',
  format: 'umd',
  moduleName: 'sharpangles.sample-dependency',
  sourceMap: 'inline',
  onwarn: function (warning) { if (warning.code !== 'THIS_IS_UNDEFINED') console.error(warning.message); },
  external: [
    '@angular/core',
    '@angular/common',
    '@angular/forms',
    '@angular/http',
    '@angular/platform-browser/animations',
    '@angular/platform-webworker',
    'rxjs/Observable',
    'rxjs/AsyncSubject',
    'rxjs/add/operator/publishLast',
    'rxjs/add/operator/map',
    'rxjs/add/operator/toPromise'
  ],
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/forms': 'ng.forms',
    '@angular/http': 'ng.http',
    '@angular/platform-browser/animations': 'ng.platform-browser.animations',
    '@angular/platform-webworker': 'ng.platform-webworker',
    '@angular/http': 'ng.http',
    'rxjs/Observable': 'Rx',
    'rxjs/AsyncSubject': 'Rx',
    'rxjs/add/operator/publishLast': 'Rx.Observable.prototype',
    'rxjs/add/operator/map': 'Rx.Observable.prototype',
    'rxjs/add/operator/toPromise': 'Rx.Observable.prototype'
  }
}