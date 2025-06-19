/**
 * Turbopack-specific PostCSS Configuration
 * This configuration is specifically designed for Turbopack's CSS processing
 * and ensures admin panel styles are properly handled
 */

export default {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
    // Disable aggressive CSS optimization for Turbopack
    cssnano: false,
    // Disable PurgeCSS for Turbopack to prevent admin panel style removal
    '@fullhuman/postcss-purgecss': false,
  },
}
