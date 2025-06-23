import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

logDebug('Setting up reward system...')

try {
  // Run the scripts using payload cli
  logDebug('Adding reward email templates...')
  execSync('npx payload run src/scripts/add-reward-email-templates.js', { stdio: 'inherit' })

  logDebug('Adding reward email campaigns...')
  execSync('npx payload run src/scripts/add-reward-email-campaign.js', { stdio: 'inherit' })

  logDebug('Reward system setup completed successfully!')
} catch (error) {
  logError('Error setting up reward system:', error)
  process.exit(1)
}
