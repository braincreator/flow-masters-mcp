/**
 * This script tests the enhanced email system by sending test emails
 * using both CMS templates and code templates.
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import path from 'path';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection string
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flow-masters';

// Test email recipient - CHANGE THIS TO YOUR EMAIL
const TEST_EMAIL = process.env.TEST_EMAIL || 'your-email@example.com';

// Function to create a test email transport
function createTestTransport() {
  // Check if real email sending is enabled in development
  const useRealEmailInDev = process.env.USE_REAL_EMAIL_IN_DEV === 'true';

  // If we're in development and not using real email, use ethereal (fake SMTP service)
  if (process.env.NODE_ENV !== 'production' && !useRealEmailInDev) {
    // Create a test account on ethereal.email
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || '',
        pass: process.env.ETHEREAL_PASSWORD || '',
      },
    });
  }

  // Use real SMTP settings for production or when explicitly enabled in development
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

// Function to send a test email using a template from MongoDB
async function sendTestEmailWithTemplate(templateSlug, data) {
  let client;
  let transport;
  
  try {
    console.log(`Sending test email using template: ${templateSlug}`);
    
    // Connect to MongoDB
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db();
    const emailTemplatesCollection = db.collection('email-templates');
    const senderEmailsCollection = db.collection('sender-emails');
    
    // Get the template
    const template = await emailTemplatesCollection.findOne({ slug: templateSlug });
    
    if (!template) {
      throw new Error(`Template ${templateSlug} not found in the database`);
    }
    
    // Get the sender
    const sender = await senderEmailsCollection.findOne({ _id: template.sender });
    
    if (!sender) {
      throw new Error(`Sender not found for template ${templateSlug}`);
    }
    
    // Create email transport
    transport = createTestTransport();
    
    // Prepare the email content
    let subject = template.subject;
    let html = template.body;
    
    // Handle localized subject
    if (typeof subject === 'object' && subject !== null) {
      subject = subject[data.locale] || subject.en || subject.ru || Object.values(subject)[0];
    }
    
    // Replace placeholders in subject and body
    subject = replacePlaceholders(subject, data);
    html = replacePlaceholders(html, data);
    
    // Send the email
    const info = await transport.sendMail({
      from: `"${sender.senderName}" <${sender.emailAddress}>`,
      to: data.email,
      subject,
      html,
    });
    
    // Check if we're using Ethereal (fake SMTP) in development
    const useRealEmailInDev = process.env.USE_REAL_EMAIL_IN_DEV === 'true';
    const isEtherealEmail = process.env.NODE_ENV !== 'production' && !useRealEmailInDev;
    
    // In development mode with Ethereal, show preview URL
    if (isEtherealEmail && info.messageId) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    // If using real email in development, log a clear message
    if (process.env.NODE_ENV !== 'production' && useRealEmailInDev) {
      console.log(`REAL EMAIL SENT to ${data.email} - Check the actual inbox!`);
    }
    
    console.log(`Email sent successfully. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending test email with template ${templateSlug}:`, error);
    return false;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Function to replace placeholders in text
function replacePlaceholders(text, data) {
  return text.replace(/\{\{([^}]+)\}\}/g, (_match, key) => {
    const keys = key.trim().split('.');
    let value = data;
    
    // Support for nested properties (e.g., {{user.name}})
    for (const k of keys) {
      if (value === undefined || value === null) break;
      value = value[k];
    }
    
    return value !== undefined && value !== null ? String(value) : '';
  });
}

// Main function to run tests
async function runTests() {
  try {
    console.log('Starting email template tests...');
    
    // Test welcome email
    await sendTestEmailWithTemplate('welcome-email', {
      email: TEST_EMAIL,
      name: 'Test User',
      locale: 'en',
      unsubscribeToken: 'test-token',
      siteUrl: 'https://flow-masters.ru',
      title: 'Welcome to Flow Masters',
      description: 'Welcome email test'
    });
    
    // Test password reset email
    await sendTestEmailWithTemplate('password-reset', {
      email: TEST_EMAIL,
      name: 'Test User',
      locale: 'en',
      resetToken: 'test-reset-token',
      siteUrl: 'https://flow-masters.ru',
      title: 'Password Reset',
      description: 'Password reset email test'
    });
    
    // Test course enrollment email
    await sendTestEmailWithTemplate('course-enrollment', {
      email: TEST_EMAIL,
      userName: 'Test User',
      locale: 'en',
      courseName: 'Test Course',
      courseId: 'course123',
      courseUrl: 'https://flow-masters.ru/courses/course123',
      isPaid: true,
      orderNumber: 'ORD-12345',
      siteUrl: 'https://flow-masters.ru',
      title: 'Course Enrollment',
      description: 'Course enrollment email test'
    });
    
    console.log('Email template tests completed');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests()
  .then(() => {
    console.log('Test script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test script failed:', error);
    process.exit(1);
  });
