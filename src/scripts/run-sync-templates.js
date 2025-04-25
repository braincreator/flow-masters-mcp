// This script is used to run the sync-email-templates.ts script
// It compiles the TypeScript file and then runs it

import { exec } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to the TypeScript file
const scriptPath = path.resolve(__dirname, 'sync-email-templates.ts')

// Compile and run the TypeScript file
console.log('Compiling and running sync-email-templates.ts...')

// Use tsx to run the TypeScript file directly
exec(`npx tsx ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`)
    return
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`)
  }

  console.log(stdout)
  console.log('Template sync completed!')
})
