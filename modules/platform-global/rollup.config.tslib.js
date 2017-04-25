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
  onwarn: function (warning) { if (warning.code !== 'THIS_IS_UNDEFINED') console.error(warning.message); }
}
