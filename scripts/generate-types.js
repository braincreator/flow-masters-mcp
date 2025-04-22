#!/usr/bin/env node

// This script is a wrapper around payload generate:types that handles CSS imports
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// Run the payload generate:types command with a custom loader
try {
  console.log('Generating Payload types with CSS import handling...')
  execSync(
    'node --experimental-loader ./scripts/css-loader.mjs ./node_modules/payload/dist/bin/payload.js generate:types',
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--no-deprecation',
      },
    },
  )
  console.log('Types generated successfully!')
} catch (error) {
  console.error('Error generating types:', error)
  process.exit(1)
}
