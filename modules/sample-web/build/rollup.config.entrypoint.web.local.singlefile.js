import alias from 'rollup-plugin-alias';


export default {
  entry: './__artifacts/build/entrypoint/local-singlefile/sample-web/build/entrypoint.web.local.singlefile.js',
  dest: './__artifacts/serve/entrypoint.web.local.singlefile.umd.js',
  format: 'umd',
  moduleName: 'sharpangles.sample-app',
  sourceMap: true,
  onwarn: function (warning) { if (warning.code !== 'THIS_IS_UNDEFINED') console.error(warning.message); },
  plugins: [alias({
      '@sharpangles': '../..'
  })]
}



// export default {
//   entry: './__artifacts/build/entrypoint/local-singlefile/sample-web/build/entrypoint.web.local.singlefile.js',
//   dest: './__artifacts/serve/entrypoint.web.local.singlefile.umd.js',
//   format: 'umd',
//   moduleName: 'sharpangles.sample-app',
//   sourceMap: 'inline',
//   onwarn: function (warning) { if (warning.code !== 'THIS_IS_UNDEFINED') console.error(warning.message); }
// }
