/**
 * API endpoint to preview email templates
 * This endpoint allows previewing email templates with sample data
 */

import { Payload } from 'payload'
import { replacePlaceholders } from '../utilities/emailTemplateHelpers'
import { lexicalToHtml } from '../utilities/lexicalToHtml'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export const previewEmailTemplate = async (req: any, res: any): Promise<void> => {
  const payload: Payload = req.payload
  
  try {
    const { slug, data, locale = 'ru' } = req.body
    
    if (!slug) {
      res.status(400).json({ error: 'Template slug is required' })
      return
    }
    
    // Find the template in the CMS
    const template = await payload.find({
      collection: 'email-templates',
      where: {
        slug: {
          equals: slug
        }
      }
    })
    
    if (template.docs.length === 0) {
      res.status(404).json({ error: `Template with slug "${slug}" not found` })
      return
    }
    
    const templateDoc = template.docs[0]
    
    // Get the sender information
    const sender = await payload.findByID({
      collection: 'sender-emails',
      id: templateDoc.sender as string
    })
    
    // Prepare the email content
    let subject = templateDoc.subject
    let body = templateDoc.body
    
    // Handle localized subject
    if (typeof subject === 'object' && subject !== null) {
      subject = subject[locale] || subject.en || subject.ru || Object.values(subject)[0]
    }
    
    // Convert body from Lexical format to HTML if needed
    if (typeof body === 'object' && body !== null) {
      // Handle localized body
      if (body[locale]) {
        body = body[locale]
      } else if (body.en) {
        body = body.en
      } else if (body.ru) {
        body = body.ru
      } else {
        body = Object.values(body)[0]
      }
      
      // Convert Lexical to HTML
      body = lexicalToHtml(body)
    }
    
    // Replace placeholders in subject and body
    const mergedData = {
      ...data,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'
    }
    
    subject = replacePlaceholders(subject, mergedData)
    body = replacePlaceholders(body, mergedData)
    
    // Return the preview data
    res.status(200).json({
      template: {
        name: templateDoc.name,
        slug: templateDoc.slug,
        description: templateDoc.description
      },
      sender: {
        name: sender.senderName,
        email: sender.emailAddress
      },
      subject,
      body,
      previewUrl: `/api/preview-email?slug=${slug}&locale=${locale}`
    })
  } catch (error) {
    logError('Error previewing email template:', error)
    res.status(500).json({ error: 'Failed to preview email template' })
  }
}
