# Email Campaign System Documentation

This document provides an overview of the email campaign system implemented in the Flow Masters platform.

## Overview

The email campaign system allows for creating, managing, and executing email campaigns with various trigger types, audience targeting, and scheduling options. It provides a flexible way to send templated emails to users based on different criteria.

## Key Components

### 1. Email Campaign Collection

The `EmailCampaigns` collection stores all campaign data, including:

- Basic information (name, description)
- Status (draft, active, processing, completed, paused, error)
- Trigger type (manual, scheduled, event-based)
- Target audience configuration
- Email sequence with templates
- Statistics and logs

### 2. Email Templates

Campaigns use templates from the existing `email-templates` collection, which contain:
- Subject line
- Email body (rich text or plain text)
- Sender information

### 3. Email Service

The `EmailService` provides methods for:
- Sending template-based emails with variable replacement
- Converting rich text to HTML
- Sending campaign emails to multiple recipients

### 4. Job Processing

The system uses Payload's job queue for processing campaigns:
- `email-campaign` job for processing individual campaigns
- Scheduled job for checking and triggering scheduled campaigns
- Event-based triggers for responding to system events

### 5. API Endpoints

Several API endpoints are available for interacting with campaigns:
- `/api/v1/email-campaigns/trigger` - Manually trigger a campaign
- `/api/v1/email-campaigns/status` - Check campaign status
- `/api/v1/email-campaigns/trigger-event` - Trigger event-based campaigns

### 6. Admin Interface

A custom admin interface for managing campaigns, including:
- Campaign list with status indicators
- Campaign details with statistics
- Controls for triggering, pausing, and editing campaigns

## Campaign Types

### Manual Campaigns

- Created and triggered manually by administrators
- Useful for one-time announcements or promotions

### Scheduled Campaigns

- Run automatically based on a schedule (once, daily, weekly, monthly)
- Can have a start date and optional end date
- Recurring campaigns will run at the specified frequency

### Event-Based Campaigns

- Triggered by system events (user registration, order creation, etc.)
- Can include a delay before sending
- Can target the specific user related to the event

## Audience Targeting

Campaigns can target different audience segments:

1. **All Subscribers** - Send to all active newsletter subscribers
2. **User Segment** - Send to users in a specific segment
3. **User Filter** - Send to users matching custom filter criteria
4. **Event Related** - Send to users related to a specific event

## Email Sequence

Campaigns can include a sequence of emails with:
- Different templates for each step
- Optional delays between emails
- Conditional sending based on user actions

## Statistics and Tracking

The system tracks various metrics for campaigns:
- Total emails sent
- Open rate
- Click rate
- Bounce rate
- Unsubscribe rate

## Implementation Details

### Campaign Processing Flow

1. Campaign is created and set to "active" status
2. For manual campaigns, the afterChange hook queues the job
3. For scheduled campaigns, the hourly check identifies and queues them
4. For event-based campaigns, the event trigger endpoint queues them
5. The email-campaign job processes the campaign:
   - Identifies target recipients
   - Sends emails using templates
   - Updates campaign statistics
   - Logs the results

### Event Handling

The system can respond to various events:
- User registration
- Order creation/updates
- Newsletter subscription
- Abandoned cart
- Custom events

## Usage Examples

### Creating a Welcome Email Sequence

1. Create templates for each email in the sequence
2. Create a campaign with event trigger type "user.registered"
3. Add templates to the email sequence with appropriate delays
4. Set the campaign to "active"
5. When users register, they'll automatically receive the welcome sequence

### Running a Promotional Campaign

1. Create a template for the promotional email
2. Create a campaign with manual trigger type
3. Target a specific user segment
4. Add the template to the email sequence
5. Activate the campaign when ready to send

## Best Practices

1. Test templates before using them in campaigns
2. Start with small audience segments for new campaigns
3. Monitor campaign statistics to improve future campaigns
4. Use event-based campaigns for timely, relevant communications
5. Respect user preferences and provide clear unsubscribe options

## Future Enhancements

Potential improvements to consider:
- A/B testing for email templates
- More advanced audience segmentation
- Improved analytics and reporting
- Integration with external email services
- Enhanced personalization options
