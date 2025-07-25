/**
 * Test the EmailService directly with a mock Payload instance
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { EmailService } from '../services/email.service.js';
import { EmailTemplateSlug } from '../types/emailTemplates.js';

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Load environment variables from .env and .env.local
dotenv.config({ path: path.resolve(rootDir, '.env') });
dotenv.config({ path: path.resolve(rootDir, '.env.local') });

// Log environment variables for debugging
logDebug('SMTP_HOST:', process.env.SMTP_HOST);
logDebug('SMTP_USER:', process.env.SMTP_USER);
logDebug('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***' : 'not set');

// Test email recipient
const TEST_EMAIL = 'ay.krasnodar@gmail.com';

// Create a mock Payload instance
const mockPayload = {
  find: async () => ({ docs: [] }),
  create: async () => ({}),
  update: async () => ({}),
  logger: {
    info: console.log,
    error: console.error,
    warn: console.warn,
  },
};

async function testEmailService() {
  try {
    logDebug('Starting EmailService test...');
    
    // Create an instance of the EmailService
    const emailService = EmailService.getInstance(mockPayload);
    
    logDebug('EmailService initialized');
    
    // Test sending a welcome email
    logDebug(`Sending welcome email to ${TEST_EMAIL}...`);
    const result = await emailService.sendWelcomeEmail({
      email: TEST_EMAIL,
      name: 'Test User',
      locale: 'en',
      unsubscribeToken: 'test-token',
    });
    
    console.log(`Welcome email result: ${result ? 'Success' : 'Failed'}`);
    
    return result;
  } catch (error) {
    logError('Error testing EmailService:', error);
    return false;
  }
}

// Run the test
testEmailService()
  .then(result => {
    console.log(`Test ${result ? 'completed successfully' : 'failed'}`);
    process.exit(0);
  })
  .catch(error => {
    logError('Test script failed:', error);
    process.exit(1);
  });
