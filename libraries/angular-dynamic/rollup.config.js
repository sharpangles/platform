export default {
  entry: './release/index.js',
  dest: './release/bundles/angular-dynamic.umd.js',
  format: 'umd',
  moduleName: 'sharpangles.angular-dynamic',
  external: [
    '@angular/core',
    '@angular/forms'
  ],
  globals: {
    '@angular/core': 'ng.core',
    '@angular/forms': 'ng.forms',
    'rxjs/Observable': 'Rx',
    'rxjs/BehaviorSubject': 'Rx',
    'rxjs/Subscriber': 'Rx',
    'rxjs/scheduler/queue': 'Rx.Scheduler',
    'rxjs/operator/observeOn': 'Rx.Observable.prototype',
    'rxjs/operator/scan': 'Rx.Observable.prototype',
    'rxjs/operator/withLatestFrom': 'Rx.Observable'
  },
  onwarn: function (warning) { if (warning.code !== 'THIS_IS_UNDEFINED') console.error(warning.message); }
}
