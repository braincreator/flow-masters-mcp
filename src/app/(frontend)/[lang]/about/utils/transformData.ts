import type { AboutPage, Media } from '@/payload-types'

// Утилита для безопасного извлечения URL из Media объекта
function getMediaUrl(media: string | Media | null | undefined): string | undefined {
  if (!media) return undefined
  if (typeof media === 'string') return media
  if (typeof media === 'object' && media.url) return media.url
  return undefined
}

// Утилита для безопасного извлечения alt текста из Media объекта
function getMediaAlt(media: string | Media | null | undefined): string | undefined {
  if (!media) return undefined
  if (typeof media === 'object' && media.alt) return media.alt
  return undefined
}

// Преобразование данных AboutPage в формат для компонентов
export function transformAboutPageData(data: AboutPage) {
  return {
    hero: {
      title: data.hero?.title || '',
      subtitle: data.hero?.subtitle || '',
      backgroundImage: data.hero?.backgroundImage
        ? {
            url: getMediaUrl(data.hero.backgroundImage) || '',
            alt: getMediaAlt(data.hero.backgroundImage),
          }
        : undefined,
    },
    mission: {
      title: data.mission?.title || '',
      content: data.mission?.content,
    },
    stats: {
      title: data.stats?.title || '',
      subtitle: data.stats?.subtitle || undefined,
      items: (data.stats?.items || []).map((item) => ({
        value: item.value,
        label: item.label,
        description: item.description || undefined,
        icon: item.icon || undefined,
      })),
    },
    founder: {
      title: data.founder?.title || '',
      name: data.founder?.name || '',
      role: data.founder?.role || '',
      bio: data.founder?.bio,
      photo: data.founder?.photo
        ? {
            url: getMediaUrl(data.founder.photo) || '',
            alt: getMediaAlt(data.founder.photo),
          }
        : undefined,
      socialLinks: data.founder?.socialLinks
        ? {
            linkedin: data.founder.socialLinks.linkedin || undefined,
            telegram: data.founder.socialLinks.telegram || undefined,
            email: data.founder.socialLinks.email || undefined,
            website: data.founder.socialLinks.website || undefined,
          }
        : undefined,
    },
    values: {
      title: data.values?.title || '',
      subtitle: data.values?.subtitle || undefined,
      items: (data.values?.items || []).map((item) => ({
        title: item.title,
        description: item.description,
        icon: item.icon || undefined,
      })),
    },
    approach: {
      title: data.approach?.title || '',
      subtitle: data.approach?.subtitle || undefined,
      steps: (data.approach?.steps || []).map((step) => ({
        title: step.title,
        description: step.description,
        icon: step.icon || undefined,
      })),
    },
    cta: {
      title: data.cta?.title || '',
      subtitle: data.cta?.subtitle || undefined,
      primaryButton: data.cta?.primaryButton || { text: '', url: '' },
      secondaryButton: data.cta?.secondaryButton || undefined,
    },
    seo: data.seo,
  }
}
