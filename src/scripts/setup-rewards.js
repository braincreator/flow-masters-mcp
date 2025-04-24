import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('Setting up reward system...')

try {
  // Run the scripts using payload cli
  console.log('Adding reward email templates...')
  execSync('npx payload run src/scripts/add-reward-email-templates.js', { stdio: 'inherit' })

  console.log('Adding reward email campaigns...')
  execSync('npx payload run src/scripts/add-reward-email-campaign.js', { stdio: 'inherit' })

  console.log('Reward system setup completed successfully!')
} catch (error) {
  console.error('Error setting up reward system:', error)
  process.exit(1)
}
