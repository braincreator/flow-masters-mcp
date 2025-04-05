import { getPayload } from 'payload'
import { Payload } from 'payload/dist/payload'
import { InitOptions } from 'payload/config'
import nodemailer from 'nodemailer'
import { RichTextContent } from 'payload/types' // Use the actual type if available
import { SenderEmails } from '@/payload/collections/SenderEmails' // Import SenderEmails type
import { EmailTemplates } from '@/payload/collections/EmailTemplates' // Import EmailTemplates type

// Placeholder: Implement a robust RichText to HTML converter
// Consider using @payloadcms/richtext-lexical renderer or a custom one.
function richTextToHtml(content: RichTextContent | any): string {
  if (!content) return ''
  // Basic paragraph example
  if (content.root && content.root.children) {
    return content.root.children
      .map((node: any) => {
        if (node.type === 'paragraph') {
          return `<p>${node.children
            .map((textNode: any) => {
              let text = textNode.text || ''
              if (textNode.bold) text = `<strong>${text}</strong>`
              if (textNode.italic) text = `<em>${text}</em>`
              // ... handle other marks/formats
              return text
            })
            .join('')}</p>`
        }
        // ... handle other node types (headings, lists, links, etc.)
        return ''
      })
      .join('')
  }
  return '' // Return empty string if content format is unexpected
}

// Function to replace placeholders like {{variable}}
function replacePlaceholders(template: string, data: Record<string, any>): string {
  if (!template) return ''
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match
  })
}

interface SendEmailOptions {
  to: string
  templateSlug: string
  data: Record<string, any>
  payloadConfig?: InitOptions // Optional: pass if not using global payload
}

export async function sendTemplatedEmail({
  to,
  templateSlug,
  data,
  payloadConfig,
}: SendEmailOptions): Promise<boolean> {
  let payload: Payload | null = null
  try {
    payload = await getPayload({ config: payloadConfig })

    // 1. Fetch Email Settings (SMTP only)
    const emailSettings = await payload.findGlobal({
      slug: 'email-settings',
    })

    if (
      !emailSettings.smtpHost ||
      !emailSettings.smtpPort ||
      !emailSettings.smtpUser ||
      !emailSettings.smtpPassword
    ) {
      payload.logger.error('Email SMTP settings are incomplete.')
      return false
    }

    // 2. Fetch Email Template and its Sender
    const templateResult = await payload.find({
      collection: 'email-templates',
      where: {
        slug: {
          equals: templateSlug,
        },
      },
      limit: 1,
      depth: 1, // Crucial: Set depth to 1 to populate the 'sender' relationship
    })

    if (!templateResult.docs || templateResult.docs.length === 0) {
      payload.logger.error(`Email template with slug "${templateSlug}" not found.`)
      return false
    }
    const template = templateResult.docs[0] as EmailTemplates // Type assertion

    // 3. Validate Sender relationship
    const sender = template.sender as SenderEmails // Type assertion - sender is populated due to depth: 1
    if (!sender || typeof sender !== 'object' || !sender.emailAddress || !sender.senderName) {
      payload.logger.error(
        `Sender information is missing or invalid for email template "${templateSlug}". Check the 'sender' relationship.`,
      )
      return false
    }

    // 4. Prepare Email Content
    const subject = replacePlaceholders(template.subject, data)
    let bodyHtml = richTextToHtml(template.body)
    bodyHtml = replacePlaceholders(bodyHtml, data)
    const signatureHtml = richTextToHtml(sender.signature)

    const finalHtml = `
      <html>
        <body>
          ${bodyHtml}
          <br />
          <hr />
          ${signatureHtml}
        </body>
      </html>
    `

    // 5. Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: emailSettings.smtpHost,
      port: emailSettings.smtpPort,
      secure: emailSettings.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: emailSettings.smtpUser,
        pass: emailSettings.smtpPassword, // Ensure this is handled securely
      },
    })

    // 6. Send Email using Sender info
    const mailOptions = {
      from: `"${sender.senderName}" <${sender.emailAddress}>`,
      to: to,
      subject: subject,
      html: finalHtml,
    }

    await transporter.sendMail(mailOptions)
    payload.logger.info(
      `Email sent successfully to ${to} using template "${templateSlug}" from ${sender.emailAddress}`,
    )
    return true
  } catch (error: any) {
    // Ensure payload is available for logging, even if error happened before initialization
    if (!payload) {
      try {
        payload = await getPayload({ config: payloadConfig })
      } catch (initError) {
        console.error('Failed to initialize Payload for error logging:', initError)
        console.error(
          `Original Error sending email using template "${templateSlug}" to ${to}: ${error.message}`,
        )
        return false
      }
    }
    payload.logger.error(
      `Error sending email using template "${templateSlug}" to ${to}: ${error.message}`,
    )
    console.error(error) // Log the full error for debugging
    return false
  }
}
