/**
 * API endpoint to render an email template preview
 * This endpoint returns the HTML of an email template for preview in the browser
 */

import { Payload } from 'payload'
import { replacePlaceholders } from '../utilities/emailTemplateHelpers'
import { lexicalToHtml } from '../utilities/lexicalToHtml'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export const previewEmail = async (req: any, res: any): Promise<void> => {
  const payload: Payload = req.payload
  
  try {
    const { slug, locale = 'ru' } = req.query
    
    if (!slug) {
      res.status(400).send('Template slug is required')
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
      res.status(404).send(`Template with slug "${slug}" not found`)
      return
    }
    
    const templateDoc = template.docs[0]
    
    // Prepare the email content
    let body = templateDoc.body
    
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
    
    // Replace placeholders with sample data
    const sampleData = {
      name: 'John Doe',
      userName: 'John Doe',
      email: 'user@example.com',
      courseName: 'Introduction to Flow Masters',
      courseId: 'course123',
      certificateId: 'cert123',
      completionDate: new Date().toISOString(),
      progressPercentage: 50,
      orderNumber: 'ORD-12345',
      orderDate: new Date().toISOString(),
      paymentAmount: 99.99,
      rewardTitle: 'Achievement Unlocked',
      rewardDescription: 'You have unlocked a special reward!',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru'
    }
    
    body = replacePlaceholders(body, sampleData)
    
    // Set content type and send the HTML
    res.setHeader('Content-Type', 'text/html')
    res.send(body)
  } catch (error) {
    logError('Error rendering email preview:', error)
    res.status(500).send('Failed to render email preview')
  }
}
