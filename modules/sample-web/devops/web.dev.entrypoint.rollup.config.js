import alias from 'rollup-plugin-alias';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  entry: './__artifacts/build/entrypoint/dev/sample-web/devops/web.dev.entrypoint.js',
  dest: './__artifacts/serve/web.dev.entrypoint.umd.js',
  format: 'umd',
  moduleName: 'sharpangles.sample-app',
  sourceMap: true,
  onwarn: function (warning) { if (warning.code !== 'THIS_IS_UNDEFINED') console.error(warning.message); },
  plugins: [
    alias({
      '@sharpangles': '../..'
    }),
    sourcemaps()
  ]
}
