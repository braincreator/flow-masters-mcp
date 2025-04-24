import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { getPayloadClient } from '@/utilities/payload'
import { CourseCompletePage } from '@/components/courses/CourseCompletePage'
import { notFound } from 'next/navigation'

interface Props {
  params: {
    lang: string
    slug: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Сначала получаем параметры с помощью await
  const { lang, slug } = await Promise.resolve(params)

  const payload = await getPayloadClient()

  // Find the course by slug
  const courses = await payload.find({
    collection: 'courses',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  if (courses.docs.length === 0) {
    return {
      title: 'Course Not Found',
      description: 'The requested course could not be found.',
    }
  }

  const course = courses.docs[0]

  return {
    title: `Congratulations! You've Completed ${course.title}`,
    description: `You've successfully completed the ${course.title} course. Get your certificate now!`,
  }
}

export default async function CourseCompletionPage({ params }: Props) {
  // Сначала получаем параметры с помощью await
  const { lang, slug } = await Promise.resolve(params)

  // Устанавливаем локаль
  setRequestLocale(lang)

  const payload = await getPayloadClient()

  // Find the course by slug
  const courses = await payload.find({
    collection: 'courses',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  if (courses.docs.length === 0) {
    notFound()
  }

  const course = courses.docs[0]

  return <CourseCompletePage course={course} locale={lang} />
}
