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
      process.env.NODE_ENV === 'production'
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
                // Payload CMS admin panel classes
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
