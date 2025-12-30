const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('rollup-plugin-typescript');

module.exports = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [resolve(), commonjs(), typescript()],
};
