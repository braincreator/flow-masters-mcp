import fs from 'fs'
import path from 'path'

const packageJsonPath = path.join(process.cwd(), '.next', 'standalone', 'package.json')

fs.readFile(packageJsonPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading package.json:', err)
    return
  }

  const packageJson = JSON.parse(data)

  packageJson.type = 'commonjs'

  fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing package.json:', err)
      return
    }
    console.log('Successfully patched .next/standalone/package.json to use CommonJS')
  })
})
