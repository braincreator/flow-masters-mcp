// src/utilities/emailTemplates/courses/waitingListVacancy.ts

interface WaitingListVacancyEmailProps {
  userName: string;
  courseName: string;
  courseLink: string; // Direct link to the course page
  siteUrl: string; // Base site URL
  locale?: string; // Optional locale for i18n
}

export const generateWaitingListVacancyEmail = ({
  userName,
  courseName,
  courseLink,
  siteUrl,
  locale = 'en', // Default locale
}: WaitingListVacancyEmailProps): string => {
  // Basic HTML structure - can be enhanced with MJML or a proper templating engine later
  const subject = `Spot Available: ${courseName}`; // Simple subject line

  const body = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${subject}</title>
      <style>
        body { font-family: sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Spot Available in ${courseName}!</h1>
        <p>Hi ${userName},</p>
        <p>Good news! A spot has opened up in the course you were waitlisted for: <strong>${courseName}</strong>.</p>
        <p>Don't miss this chance to enroll. Click the button below to visit the course page and secure your place:</p>
        <p style="text-align: center;">
          <a href="${courseLink}" class="button">Enroll in ${courseName} Now</a>
        </p>
        <p>If you're no longer interested, you can ignore this email.</p>
        <p>Best regards,<br>The Flow Masters Team</p>
        <hr>
        <p style="font-size: 0.8em; color: #777;">
          You received this email because you joined the waiting list for ${courseName} on <a href="${siteUrl}">${siteUrl}</a>.
        </p>
      </div>
    </body>
    </html>
  `;

  return body; // The sync script extracts the title tag for the subject
};