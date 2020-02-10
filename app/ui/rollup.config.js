import resolve from 'rollup-plugin-node-resolve';
import common from 'rollup-plugin-commonjs';
import multiEntry from 'rollup-plugin-multi-entry';

export default {
  input: 'lib/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  plugins: [
    common({
      namedExports: {
        'chai': ['expect']
      }
    }),
    resolve(),
    multiEntry()
  ],
  watch: [
    
  ]
};