import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  entry: './__artifacts/build/entrypoint/local/web.local.entrypoint.js',
  dest: './__artifacts/serve/web.local.entrypoint.umd.js',
  format: 'umd',
  moduleName: 'sharpangles.sample-app',
  sourceMap: true,
  plugins: [sourcemaps()],
  onwarn: function (warning) { if (warning.code !== 'THIS_IS_UNDEFINED') console.error(warning.message); },
  external: [
    '@sharpangles/platform-global',
    'tslib'
  ],
  globals: {
    '@sharpangles/platform-global': 'sharpangles.platform-global',
    'tslib': 'tslib'
  }
}
