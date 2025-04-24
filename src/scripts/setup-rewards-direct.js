import { getPayloadClient } from '../utilities/payload/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to set up the reward system
 */
async function setupRewardSystem() {
  try {
    console.log('Setting up reward system...');
    const payload = await getPayloadClient();

    // Get default sender
    const senders = await payload.find({
      collection: 'sender-emails',
      limit: 1,
    });

    if (senders.docs.length === 0) {
      console.error('No sender emails found. Please create a sender email first.');
      return;
    }

    const defaultSender = senders.docs[0].id;

    // Templates to add
    const templates = [
      {
        name: 'Общий шаблон награды',
        slug: 'reward-generic',
        subject: 'Вы получили награду!',
        templatePath: 'reward-generic.html',
      },
      {
        name: 'Шаблон награды - скидка',
        slug: 'reward-discount',
        subject: 'Вы получили скидку!',
        templatePath: 'reward-discount.html',
      },
      {
        name: 'Шаблон награды - бесплатный курс',
        slug: 'reward-free-course',
        subject: 'Вы получили бесплатный курс!',
        templatePath: 'reward-free-course.html',
      },
      {
        name: 'Шаблон награды - бейдж',
        slug: 'reward-badge',
        subject: 'Вы получили бейдж!',
        templatePath: 'reward-badge.html',
      },
      {
        name: 'Шаблон награды - сертификат',
        slug: 'reward-certificate',
        subject: 'Вы получили сертификат!',
        templatePath: 'reward-certificate.html',
      },
      {
        name: 'Шаблон награды - эксклюзивный контент',
        slug: 'reward-exclusive-content',
        subject: 'Вы получили доступ к эксклюзивному контенту!',
        templatePath: 'reward-exclusive-content.html',
      },
      {
        name: 'Шаблон напоминания о награде - 1',
        slug: 'reward-reminder-1',
        subject: 'Не забудьте использовать вашу награду!',
        templatePath: 'reward-reminder-1.html',
      },
      {
        name: 'Шаблон напоминания о награде - 2',
        slug: 'reward-reminder-2',
        subject: 'Последнее напоминание о вашей награде!',
        templatePath: 'reward-reminder-2.html',
      },
      {
        name: 'Шаблон истекающей награды',
        slug: 'reward-expiring',
        subject: 'Ваша награда скоро истечет!',
        templatePath: 'reward-expiring.html',
      },
    ];

    // Add each template
    const createdTemplates = [];
    for (const template of templates) {
      // Check if template already exists
      const existingTemplate = await payload.find({
        collection: 'email-templates',
        where: {
          slug: {
            equals: template.slug,
          },
        },
      });

      if (existingTemplate.docs.length > 0) {
        console.log(`Template ${template.slug} already exists, skipping...`);
        createdTemplates.push(existingTemplate.docs[0]);
        continue;
      }

      // Read template file
      const templatePath = path.resolve(__dirname, '../email-templates', template.templatePath);
      const templateContent = fs.readFileSync(templatePath, 'utf-8');

      // Create template
      const createdTemplate = await payload.create({
        collection: 'email-templates',
        data: {
          name: template.name,
          slug: template.slug,
          subject: template.subject,
          sender: defaultSender,
          body: templateContent,
        },
      });

      createdTemplates.push(createdTemplate);
      console.log(`Added template: ${template.slug}`);
    }

    console.log('All reward email templates added successfully!');

    // Create campaign for reward.awarded event
    const awardedCampaign = {
      name: 'Награда получена - последовательность писем',
      description: 'Отправляет серию писем после получения награды для повышения вовлеченности',
      status: 'active',
      triggerType: 'event',
      eventTrigger: {
        eventType: 'reward.awarded',
        delay: 0,
        conditions: {},
      },
      targetAudience: {
        audienceType: 'event_related',
      },
      emailSequence: [
        {
          template: createdTemplates.find(t => t.slug === 'reward-generic')?.id,
          delay: 0,
        },
        {
          template: createdTemplates.find(t => t.slug === 'reward-reminder-1')?.id,
          delay: 72, // 3 days
          condition: {
            rewardStatus: 'active',
          },
        },
        {
          template: createdTemplates.find(t => t.slug === 'reward-reminder-2')?.id,
          delay: 168, // 7 days
          condition: {
            rewardStatus: 'active',
          },
        },
      ],
    };

    // Check if campaign already exists
    const existingCampaign = await payload.find({
      collection: 'email-campaigns',
      where: {
        name: {
          equals: awardedCampaign.name,
        },
      },
    });

    if (existingCampaign.docs.length > 0) {
      console.log(`Campaign "${awardedCampaign.name}" already exists, skipping...`);
    } else {
      // Create campaign
      await payload.create({
        collection: 'email-campaigns',
        data: awardedCampaign,
      });

      console.log(`Added campaign: ${awardedCampaign.name}`);
    }

    // Create campaign for reward.expiring event
    const expiringCampaign = {
      name: 'Награда истекает - напоминание',
      description: 'Отправляет письмо, когда награда скоро истечет',
      status: 'active',
      triggerType: 'event',
      eventTrigger: {
        eventType: 'reward.expiring',
        delay: 0,
        conditions: {},
      },
      targetAudience: {
        audienceType: 'event_related',
      },
      emailSequence: [
        {
          template: createdTemplates.find(t => t.slug === 'reward-expiring')?.id,
          delay: 0,
        },
      ],
    };

    // Check if campaign already exists
    const existingExpiringCampaign = await payload.find({
      collection: 'email-campaigns',
      where: {
        name: {
          equals: expiringCampaign.name,
        },
      },
    });

    if (existingExpiringCampaign.docs.length > 0) {
      console.log(`Campaign "${expiringCampaign.name}" already exists, skipping...`);
    } else {
      // Create campaign
      await payload.create({
        collection: 'email-campaigns',
        data: expiringCampaign,
      });

      console.log(`Added campaign: ${expiringCampaign.name}`);
    }

    console.log('All reward email campaigns added successfully!');
    console.log('Reward system setup completed successfully!');
  } catch (error) {
    console.error('Error setting up reward system:', error);
  }
}

// Run the script
setupRewardSystem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
