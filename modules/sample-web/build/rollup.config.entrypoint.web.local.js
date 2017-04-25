export default {
  entry: './__artifacts/build/entrypoint/local/entrypoint.web.local.js',
  dest: './__artifacts/serve/entrypoint.web.local.umd.js',
  format: 'umd',
  moduleName: 'sharpangles.sample-app',
  sourceMap: 'inline',
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
