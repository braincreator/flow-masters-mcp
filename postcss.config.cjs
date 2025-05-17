/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    'postcss-preset-env': {
      features: {
        'custom-properties': false,
        'logical-properties-and-values': false,
      },
      autoprefixer: {
        flexbox: 'no-2009',
      },
    },
    'postcss-import': { path: ['./node_modules'] },
  },
}
