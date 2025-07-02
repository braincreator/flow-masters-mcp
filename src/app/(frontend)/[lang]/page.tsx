// src/app/(frontend)/[lang]/page.tsx
import { AIAgencyLanding } from './home/components/AIAgencyLanding';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import SERPLinks, { DEFAULT_SERP_LINKS, DEFAULT_SEARCH_ACTION } from '@/components/SEO/SERPLinks';
import LLMOptimization from '@/components/SEO/LLMOptimization';
import FAQSchema, { FLOW_MASTERS_FAQ } from '@/components/SEO/FAQSchema';
import BreadcrumbsSchema from '@/components/SEO/BreadcrumbsSchema';
import OrganizationSchema from '@/components/SEO/OrganizationSchema';

interface LangHomePageProps {
  params: Promise<{
    lang: 'en' | 'ru'; // Or simply string if more locales are supported
  }>;
}

export default async function LangHomePage({ params: paramsPromise }: LangHomePageProps) {
  const { lang } = await paramsPromise;
  setRequestLocale(lang);

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru';

  // Локализованные SERP links
  const serpLinks = DEFAULT_SERP_LINKS.map(link => ({
    ...link,
    url: `/${lang}${link.url}`,
    name: lang === 'en' ? getEnglishLinkName(link.name) : link.name,
    description: lang === 'en' ? getEnglishLinkDescription(link.description) : link.description,
  }));

  const searchAction = {
    target: `${baseUrl}/${lang}/search?q={search_term_string}`,
    queryInput: 'required name=search_term_string',
  };

  return (
    <>
      {/* SEO компоненты */}
      <SERPLinks links={serpLinks} searchAction={searchAction} />

      <LLMOptimization
        title={lang === 'ru' ? 'Flow Masters - Автоматизация и AI решения' : 'Flow Masters - Automation and AI Solutions'}
        description={lang === 'ru'
          ? 'Автоматизация бизнес-процессов, разработка ИИ решений, создание чат-ботов и интеграция систем для повышения эффективности бизнеса'
          : 'Business process automation, AI solutions development, chatbot creation and system integration to improve business efficiency'
        }
        keywords={lang === 'ru'
          ? ['автоматизация', 'ИИ', 'чат-боты', 'интеграция', 'n8n', 'OpenAI', 'бизнес-процессы']
          : ['automation', 'AI', 'chatbots', 'integration', 'n8n', 'OpenAI', 'business processes']
        }
        entities={[
          { name: 'Flow Masters', type: 'Organization', description: 'AI and automation company' },
          { name: 'n8n', type: 'SoftwareApplication', description: 'Workflow automation tool' },
          { name: 'OpenAI', type: 'Organization', description: 'AI technology provider' },
        ]}
        topics={lang === 'ru'
          ? ['Автоматизация бизнес-процессов', 'Искусственный интеллект', 'Чат-боты']
          : ['Business Process Automation', 'Artificial Intelligence', 'Chatbots']
        }
        language={lang}
        author="Flow Masters Team"
        category="Business Automation"
      />

      <FAQSchema faqs={FLOW_MASTERS_FAQ} />

      <BreadcrumbsSchema items={[]} />

      <OrganizationSchema language={lang} />

      {/* Основной контент */}
      <AIAgencyLanding />
    </>
  );
}

// Функции для локализации SERP links
function getEnglishLinkName(ruName: string): string {
  const translations: Record<string, string> = {
    'Услуги': 'Services',
    'Блог': 'Blog',
    'О нас': 'About',
    'Контакты': 'Contact',
    'Кейсы': 'Cases',
    'Курсы': 'Courses',
  };
  return translations[ruName] || ruName;
}

function getEnglishLinkDescription(ruDescription?: string): string | undefined {
  if (!ruDescription) return undefined;

  const translations: Record<string, string> = {
    'Автоматизация бизнес-процессов и AI решения': 'Business process automation and AI solutions',
    'Экспертные статьи об ИИ и автоматизации': 'Expert articles about AI and automation',
    'Команда экспертов по цифровой трансформации': 'Digital transformation experts team',
    'Свяжитесь с нами для консультации': 'Contact us for consultation',
    'Успешные проекты автоматизации': 'Successful automation projects',
    'Обучение работе с ИИ и автоматизацией': 'AI and automation training',
  };
  return translations[ruDescription] || ruDescription;
}

export async function generateMetadata({ params: paramsPromise }: LangHomePageProps): Promise<Metadata> {
  const { lang } = await paramsPromise;
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru';

  if (lang === 'ru') {
    return {
      title: 'Flow Masters - Автоматизация бизнес-процессов и AI решения',
      description: 'Автоматизация бизнес-процессов, разработка ИИ решений, создание чат-ботов и интеграция систем. Повысьте эффективность бизнеса с помощью современных технологий.',
      keywords: 'автоматизация, ИИ, чат-боты, интеграция систем, n8n, OpenAI, бизнес-процессы, workflow, AI решения',

      openGraph: {
        title: 'Flow Masters - Автоматизация и AI решения для бизнеса',
        description: 'Автоматизируем бизнес-процессы и внедряем ИИ решения для повышения эффективности вашего бизнеса',
        url: `${baseUrl}/${lang}`,
        siteName: 'Flow Masters',
        images: [
          {
            url: `${baseUrl}/images/og-image-ru.jpg`,
            width: 1200,
            height: 630,
            alt: 'Flow Masters - Автоматизация и AI решения',
          },
        ],
        locale: 'ru_RU',
        type: 'website',
      },

      twitter: {
        card: 'summary_large_image',
        title: 'Flow Masters - Автоматизация и AI решения',
        description: 'Автоматизируем бизнес-процессы и внедряем ИИ решения',
        images: [`${baseUrl}/images/twitter-image-ru.jpg`],
      },

      alternates: {
        canonical: `${baseUrl}/${lang}`,
        languages: {
          'ru': `${baseUrl}/ru`,
          'en': `${baseUrl}/en`,
        },
      },

      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }

  return {
    title: 'Flow Masters - Business Process Automation and AI Solutions',
    description: 'Business process automation, AI solutions development, chatbot creation and system integration. Improve your business efficiency with modern technologies.',
    keywords: 'automation, AI, chatbots, system integration, n8n, OpenAI, business processes, workflow, AI solutions',

    openGraph: {
      title: 'Flow Masters - Automation and AI Solutions for Business',
      description: 'We automate business processes and implement AI solutions to improve your business efficiency',
      url: `${baseUrl}/${lang}`,
      siteName: 'Flow Masters',
      images: [
        {
          url: `${baseUrl}/images/og-image-en.jpg`,
          width: 1200,
          height: 630,
          alt: 'Flow Masters - Automation and AI Solutions',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title: 'Flow Masters - Automation and AI Solutions',
      description: 'We automate business processes and implement AI solutions',
      images: [`${baseUrl}/images/twitter-image-en.jpg`],
    },

    alternates: {
      canonical: `${baseUrl}/${lang}`,
      languages: {
        'ru': `${baseUrl}/ru`,
        'en': `${baseUrl}/en`,
      },
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
