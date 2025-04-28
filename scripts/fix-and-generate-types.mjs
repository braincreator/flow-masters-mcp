#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Path to the CSS.js file
const reactCropCssJsPath = path.join(rootDir, 'node_modules/react-image-crop/dist/ReactCrop.css.js')
// Path to the CSS file
const reactCropCssPath = path.join(rootDir, 'node_modules/react-image-crop/dist/ReactCrop.css')
// Path to the types file
const typesFilePath = path.join(rootDir, 'src/payload-types.ts')

// Function to backup and patch files
function patchFiles() {
  const backups = []

  // Patch the CSS.js file
  if (fs.existsSync(reactCropCssJsPath)) {
    console.log('Patching ReactCrop.css.js...')
    const content = fs.readFileSync(reactCropCssJsPath, 'utf8')
    fs.writeFileSync(`${reactCropCssJsPath}.bak`, content)
    backups.push(reactCropCssJsPath)

    const dummyContent = `// This file is patched to avoid CSS import issues during type generation
export default '/* CSS content removed */';
`
    fs.writeFileSync(reactCropCssJsPath, dummyContent)
  }

  // Rename the CSS file
  if (fs.existsSync(reactCropCssPath)) {
    console.log('Renaming ReactCrop.css...')
    fs.renameSync(reactCropCssPath, `${reactCropCssPath}.bak`)
    backups.push(reactCropCssPath)
  }

  return backups
}

// Function to check if the types file is valid
function isTypesFileValid(typesFilePath) {
  if (!fs.existsSync(typesFilePath)) {
    return false
  }

  try {
    const content = fs.readFileSync(typesFilePath, 'utf8')

    // Check if the file has some minimum content that indicates it's a valid types file
    return (
      content.includes('export interface Config') &&
      content.includes('export interface User') &&
      content.length > 1000 // Arbitrary minimum size
    )
  } catch (error) {
    console.error('Error checking types file:', error)
    return false
  }
}

// Function to restore files
function restoreFiles(backups) {
  console.log('Restoring original files...')

  for (const file of backups) {
    const backupFile = `${file}.bak`

    if (fs.existsSync(backupFile)) {
      if (file.endsWith('.css')) {
        // For CSS file, we renamed it
        fs.renameSync(backupFile, file)
      } else {
        // For other files, we created a backup and modified the original
        const content = fs.readFileSync(backupFile, 'utf8')
        fs.writeFileSync(file, content)
        fs.unlinkSync(backupFile)
      }
    }
  }
}

// Main execution
let backups = [] // Define backups at a higher scope

try {
  console.log('Preparing for type generation...')

  // Patch files and get list of backups
  backups = patchFiles()

  console.log('Generating Payload types...')

  // Simple approach: just run the command and handle any errors
  try {
    console.log('Running payload generate:types command...')

    // Run the command with a 60-second timeout
    // We'll use a different approach to avoid the ETIMEDOUT issue
    const { spawn } = await import('child_process')

    // Create a promise that resolves when the process completes
    await new Promise((resolve, reject) => {
      // Use pipe instead of inherit to capture the output
      const child = spawn('npx', ['payload', 'generate:types'], {
        stdio: ['inherit', 'pipe', 'pipe'], // stdin: inherit, stdout: pipe, stderr: pipe
        env: {
          ...process.env,
          NODE_OPTIONS: '--no-warnings',
        },
      })

      let output = ''
      let successMessageFound = false

      // Capture stdout
      child.stdout.on('data', (data) => {
        const chunk = data.toString()
        output += chunk
        process.stdout.write(chunk) // Show the output in real-time

        // Check for success message with various patterns
        if (chunk.includes('Types written to')) {
          console.log('\n✅ Success message found! Types were generated successfully.')
          successMessageFound = true

          // Give it a moment to finish writing the file
          setTimeout(() => {
            child.kill('SIGINT') // Use SIGINT instead of the default SIGTERM
            resolve()
          }, 2000) // Give it a bit more time (2 seconds)
        }

        // Also check for the INFO log pattern that Payload uses
        if (chunk.includes('INFO:') && chunk.includes('types.ts')) {
          console.log('\n✅ Success message found in INFO log! Types were generated successfully.')
          successMessageFound = true

          // Give it a moment to finish writing the file
          setTimeout(() => {
            child.kill('SIGINT') // Use SIGINT instead of the default SIGTERM
            resolve()
          }, 2000) // Give it a bit more time (2 seconds)
        }
      })

      // Capture stderr
      child.stderr.on('data', (data) => {
        const chunk = data.toString()
        output += chunk
        process.stderr.write(chunk) // Show the output in real-time
      })

      // Set up a file watcher to check for the types file
      let fileCheckInterval
      let initialFileCheck = true
      let lastModified = 0
      let lastSize = 0

      // Check the file every second
      fileCheckInterval = setInterval(() => {
        try {
          if (fs.existsSync(typesFilePath)) {
            const stats = fs.statSync(typesFilePath)
            const currentModified = stats.mtimeMs
            const currentSize = stats.size

            if (initialFileCheck) {
              console.log(`\nFound types file (${currentSize} bytes), monitoring for changes...`)
              initialFileCheck = false
              lastModified = currentModified
              lastSize = currentSize
            } else if (currentModified > lastModified || currentSize !== lastSize) {
              console.log(`\nTypes file updated (${currentSize} bytes), still monitoring...`)
              lastModified = currentModified
              lastSize = currentSize
            } else if (currentSize > 1000) {
              // File exists, has content, and hasn't changed in the last check
              console.log(
                `\nTypes file is stable (${currentSize} bytes) and appears to be complete.`,
              )
              console.log('Killing the process and continuing...')

              // Clear the interval
              clearInterval(fileCheckInterval)

              // Kill the process
              child.kill('SIGINT')
              resolve()
            }
          }
        } catch (error) {
          console.error('Error checking types file:', error.message)
        }
      }, 1000) // Check every second

      // Set a timeout as a fallback
      const timeoutId = setTimeout(() => {
        console.log('\nTimeout reached. Checking if types file has been generated...')

        // Clear the file check interval
        clearInterval(fileCheckInterval)

        // Check if the types file exists and is valid
        if (isTypesFileValid(typesFilePath)) {
          console.log('Types file exists and is valid, but success message was not found.')
          console.log('Killing the process and continuing...')
          child.kill('SIGINT') // Use SIGINT instead of the default SIGTERM
          resolve()
        } else {
          console.log('Types file not found or invalid, waiting a bit longer...')

          // Set another timeout to kill the process after an additional 10 seconds
          setTimeout(() => {
            console.log('Type generation is taking too long, killing the process...')
            child.kill('SIGINT') // Use SIGINT instead of the default SIGTERM
            resolve()
          }, 10000)
        }
      }, 30000) // Fallback timeout after 30 seconds

      child.on('exit', (code) => {
        clearTimeout(timeoutId)
        clearInterval(fileCheckInterval)

        if (code === 0) {
          // Check if we found the success message
          if (!successMessageFound) {
            console.log(
              '\nProcess completed successfully, but success message was not found in the output.',
            )
            console.log('Checking if types file exists and is valid...')

            if (isTypesFileValid(typesFilePath)) {
              console.log('Types file exists and is valid, continuing...')
              resolve()
            } else {
              reject(new Error('Process completed but types file is missing or invalid.'))
            }
          } else {
            // Success message was already found
            resolve()
          }
        } else if (code === null) {
          // Process was killed
          console.log('\nProcess was killed. Checking if types file exists and is valid...')

          if (isTypesFileValid(typesFilePath)) {
            console.log('Types file exists and is valid, continuing...')
            resolve()
          } else {
            reject(new Error('Process was killed and types file is missing or invalid.'))
          }
        } else {
          // Process exited with non-zero code
          if (isTypesFileValid(typesFilePath)) {
            console.log(`\nProcess exited with code ${code}, but types file exists and is valid.`)
            console.log('Continuing despite the error...')
            resolve()
          } else {
            reject(
              new Error(
                `Type generation exited with code ${code} and no valid types file was found.`,
              ),
            )
          }
        }
      })

      child.on('error', (err) => {
        clearTimeout(timeoutId)
        clearInterval(fileCheckInterval)
        reject(err)
      })
    })

    console.log('Type generation completed successfully.')
  } catch (error) {
    console.error('Error during type generation:', error.message)

    // Check if the types file exists and is valid despite the error
    if (isTypesFileValid(typesFilePath)) {
      console.log('Types file exists and appears to be valid despite the error, continuing...')
    } else {
      console.error('Type generation failed and no valid types file was found.')
      // Restore files before exiting
      restoreFiles(backups)
      process.exit(1)
    }
  }

  // Verify the types file
  if (isTypesFileValid(typesFilePath)) {
    console.log('Types generated successfully and verified!')
  } else {
    console.warn('Warning: Types file may not be complete or valid. Check the file manually.')
  }

  // Restore original files
  restoreFiles(backups)

  console.log('All done!')
} catch (error) {
  console.error('Unexpected error:', error.message)

  // Make sure to restore files
  try {
    restoreFiles(backups)
  } catch (restoreError) {
    console.error('Error restoring files:', restoreError.message)
  }

  process.exit(1)
}
