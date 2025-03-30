export default {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
    cssnano:
      process.env.NODE_ENV === 'production'
        ? {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                reduceIdents: false,
                zindex: false,
              },
            ],
          }
        : false,
    '@fullhuman/postcss-purgecss':
      process.env.NODE_ENV === 'production'
        ? {
            content: [
              './pages/**/*.{js,jsx,ts,tsx}',
              './components/**/*.{js,jsx,ts,tsx}',
              './app/**/*.{js,jsx,ts,tsx}',
              './src/**/*.{js,jsx,ts,tsx}',
            ],
            defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
            safelist: {
              standard: ['html', 'body'],
              deep: [/^dark:/, /^data-theme/],
            },
          }
        : false,
  },
}
