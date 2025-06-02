// src/app/(frontend)/[lang]/page.tsx
import { AIAgencyLanding } from './home/components/AIAgencyLanding';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

interface LangHomePageProps {
  params: Promise<{
    lang: 'en' | 'ru'; // Or simply string if more locales are supported
  }>;
}

export default async function LangHomePage({ params: paramsPromise }: LangHomePageProps) {
  const { lang } = await paramsPromise;
  setRequestLocale(lang);

  return <AIAgencyLanding />;
}

export async function generateMetadata({ params: paramsPromise }: LangHomePageProps): Promise<Metadata> {
  const { lang } = await paramsPromise;
  // This metadata should ideally come from a translation file or be more dynamic
  // For now, a simple placeholder:
  if (lang === 'ru') {
    return {
      title: 'Главная - AI Агентство',
      description: 'Инновационные AI решения для вашего бизнеса.',
    };
  }
  return {
    title: 'Home - AI Agency',
    description: 'Innovative AI solutions for your business.',
  };
}
