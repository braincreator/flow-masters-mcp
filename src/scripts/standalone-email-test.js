/**
 * Standalone script to test email sending without dependencies
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

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

// Create a simple HTML email template
function createEmailTemplate(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.subject}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid #ddd;
    }
    .content {
      padding: 20px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #ddd;
    }
    .button {
      display: inline-block;
      background-color: #007bff;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Flow Masters</h1>
  </div>
  <div class="content">
    <h2>Hello ${data.name}!</h2>
    <p>This is a test email from the enhanced EmailService with TypeScript interfaces.</p>
    <p>The email was sent at: ${new Date().toLocaleString()}</p>
    <p>This email confirms that the EmailService has been successfully updated to use TypeScript interfaces and check for CMS templates first.</p>
    <a href="${data.siteUrl}" class="button">Visit Flow Masters</a>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Flow Masters. All rights reserved.</p>
    <p>You're receiving this email because you're testing the enhanced EmailService.</p>
  </div>
</body>
</html>
  `;
}

async function sendTestEmail() {
  try {
    logDebug('Starting standalone email test...');
    
    // Use production SMTP settings
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error(
        'SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables.',
      );
    }
    
    // Create a transporter with production settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE !== 'false', // Default to true for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    
    logDebug('Created transporter');
    
    // Create email data
    const emailData = {
      name: 'Test User',
      subject: 'Test Email from Enhanced EmailService',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
    };
    
    // Generate HTML
    const html = createEmailTemplate(emailData);
    
    logDebug('Generated email HTML');
    
    // Send the email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Flow Masters'}" <${process.env.EMAIL_FROM || 'admin@flow-masters.ru'}>`,
      to: TEST_EMAIL,
      subject: emailData.subject,
      html,
    });
    
    logDebug('Message sent: %s', info.messageId);
    logDebug(`Email successfully sent to ${TEST_EMAIL}. Please check the inbox.`);
    
    return true;
  } catch (error) {
    logError('Error sending test email:', error);
    return false;
  }
}

// Run the test
sendTestEmail()
  .then(result => {
    console.log(`Test ${result ? 'completed successfully' : 'failed'}`);
    process.exit(0);
  })
  .catch(error => {
    logError('Test script failed:', error);
    process.exit(1);
  });
