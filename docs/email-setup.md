# Email Setup Guide

This guide explains how to set up email sending in both development and production environments.

## Email Configuration Options

The application supports two modes for email sending in development:

1. **Preview Mode (Default)**: Emails are not actually sent but can be previewed in a browser
2. **Real Email Mode**: Emails are sent to actual recipients using SMTP

## Setting Up Real Email Sending in Development

To enable real email sending in development:

1. Create or edit `.env.local` file in the project root
2. Add the following configuration:

```
# Enable real email sending in development
USE_REAL_EMAIL_IN_DEV=true

# SMTP Settings
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_password

# Default sender address
EMAIL_FROM=your_email@example.com
```

### SMTP Configuration Examples

#### Gmail
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
```
Note: For Gmail, you may need to use an App Password if you have 2FA enabled.

#### Yandex
```
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
```

#### Mail.ru
```
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_SECURE=true
```

## Disabling Real Email in Development

To switch back to preview mode:

1. Set `USE_REAL_EMAIL_IN_DEV=false` in your `.env.local` file, or
2. Remove the variable completely

## Production Configuration

In production, real email sending is always enabled. Configure your environment variables on your hosting platform:

```
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_production_email@example.com
SMTP_PASSWORD=your_production_password
EMAIL_FROM=noreply@your-domain.com
```

## Testing Email Functionality

### Preview Mode
When in preview mode, the console will display a URL where you can view the email that would have been sent.

Example console output:
```
Preview URL: https://ethereal.email/message/XYZ123...
```

### Real Email Mode
When using real email in development, the console will indicate that a real email was sent:

```
REAL EMAIL SENT to recipient@example.com - Check the actual inbox!
```

## Troubleshooting

If you encounter issues with email sending:

1. Check your SMTP credentials
2. Verify that your email provider allows SMTP access
3. Some providers may require specific security settings or app passwords
4. Check the application logs for detailed error messages

For Gmail users: If you're using Gmail and getting authentication errors, you may need to:
1. Enable "Less secure app access" (not recommended for production), or
2. Create an App Password if you have 2FA enabled
