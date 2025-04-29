import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { getPayloadClient } from '@/utilities/payload/index'
import { CourseLearnPage } from '@/components/courses/CourseLearnPage'
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
    title: `Learning: ${course.title}`,
    description: course.excerpt || `Learn ${course.title} at your own pace`,
  }
}

export default async function CourseLearningPage({ params }: Props) {
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

  // Get modules for this course
  const modules = await payload.find({
    collection: 'modules',
    where: {
      course: {
        equals: course.id,
      },
    },
    sort: 'order',
    depth: 1, // Include related fields
  })

  return <CourseLearnPage course={course} modules={modules.docs} locale={lang} />
}
