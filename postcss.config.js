export default {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
    cssnano:
      // Disable CSS optimization when using Turbopack or in development
      process.env.NODE_ENV === 'production' && !process.env.TURBOPACK
        ? {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                reduceIdents: false,
                zindex: false,
                // Preserve important CSS features
                normalizeWhitespace: false,
                discardUnused: false,
                mergeIdents: false,
                reduceTransforms: false,
                svgo: false,
              },
            ],
          }
        : false,
    '@fullhuman/postcss-purgecss':
      // Disable PurgeCSS when using Turbopack to prevent admin panel style removal
      process.env.NODE_ENV === 'production' && !process.env.TURBOPACK
        ? {
            content: [
              './pages/**/*.{js,jsx,ts,tsx}',
              './components/**/*.{js,jsx,ts,tsx}',
              './app/**/*.{js,jsx,ts,tsx}',
              './src/**/*.{js,jsx,ts,tsx}',
              // Include Payload CMS files to prevent purging admin styles
              './node_modules/@payloadcms/**/*.{js,jsx,ts,tsx}',
              './node_modules/payload-admin/**/*.{js,jsx,ts,tsx}',
            ],
            defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
            safelist: {
              standard: ['html', 'body'],
              deep: [
                /^dark:/,
                /^data-theme/,
                // Payload CMS admin panel classes - comprehensive protection
                /^payload/,
                /^admin/,
                /^collection/,
                /^field/,
                /^btn/,
                /^card/,
                /^nav/,
                /^sidebar/,
                /^header/,
                /^footer/,
                /^modal/,
                /^dropdown/,
                /^tooltip/,
                /^loading/,
                /^error/,
                /^success/,
                /^warning/,
                // Specific Payload admin classes
                /payload__/,
                /payload-admin/,
                /payload-default/,
                // Theme and elevation variables
                /theme-/,
                /elevation-/,
                /color-base/,
                /color-success/,
                /color-error/,
                /color-warning/,
                /color-blue/,
                // Layout and structure classes
                /app__/,
                /main__/,
                /content__/,
                /layout__/,
                // Form and input classes
                /input__/,
                /form__/,
                /select__/,
                /textarea__/,
                /checkbox__/,
                /radio__/,
                // UI component classes that might be dynamically generated
                /^ui-/,
                /^radix-/,
                /^lucide/,
                // Animation and transition classes
                /^animate-/,
                /^transition-/,
                /^transform/,
                /^duration-/,
                /^ease-/,
                // Responsive and state classes
                /^hover:/,
                /^focus:/,
                /^active:/,
                /^disabled:/,
                /^group-/,
                /^peer-/,
                // Custom CSS variables and utilities
                /^bg-/,
                /^text-/,
                /^border-/,
                /^shadow-/,
                /^rounded-/,
                /^p-/,
                /^m-/,
                /^w-/,
                /^h-/,
                /^flex/,
                /^grid/,
                /^space-/,
                /^gap-/,
              ],
              // Specific classes that should never be purged
              greedy: [
                /data-/,
                /aria-/,
                /role=/,
                /tabindex=/,
              ],
            },
            // Skip purging for admin routes
            rejected: true,
            printRejected: process.env.NODE_ENV === 'development',
          }
        : false,
  },
}
