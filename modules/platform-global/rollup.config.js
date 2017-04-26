import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  entry: './__artifacts/build/index.js',
  dest: './__artifacts/release/bundles/platform-global.umd.js',
  format: 'umd',
  moduleName: 'sharpangles.platform-global',
  sourceMap: true,
  onwarn: function (warning) { if (warning.code !== 'THIS_IS_UNDEFINED') console.error(warning.message); },
  plugins: [sourcemaps()],
  external: [
      'tslib'
  ],
  globals: {
      'tslib': 'tslib'
  },
}
