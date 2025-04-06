import React from 'react'
import Link from 'next/link'

// Импортируем типы для словарей, если они есть (опционально)
// import { Dictionary } from '@/types/i18n'

// Определяем тип для структуры сообщений на этой странице
interface NewsletterUnsubscribedMessages {
  title: string
  getMessage: string // Строка с плейсхолдером {email}
  getMessageGeneric: string // Строка без email
  noMoreEmails: string
  resubscribePrompt: string
  resubscribeLink: string
  goHome: string
  unsubscribedEmailLabel: string
}

interface PageProps {
  params: { locale: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

const NewsletterUnsubscribedPage: React.FC<PageProps> = async ({
  params: { locale },
  searchParams,
}) => {
  const email = typeof searchParams.email === 'string' ? searchParams.email : undefined

  // --- Загрузка реальных переводов --- //
  let messages: { newsletterUnsubscribed: NewsletterUnsubscribedMessages } | null = null
  try {
    // Пытаемся загрузить JSON файл для текущей локали
    messages = (await import(`@/messages/${locale}.json`)).default
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error)
    // Загружаем дефолтный язык (например, ru) в случае ошибки
    try {
      messages = (await import(`@/messages/ru.json`)).default
    } catch (fallbackError) {
      console.error('Failed to load fallback messages (ru.json)', fallbackError)
      // Если и дефолтный не загрузился, можно показать ошибку или базовый текст
    }
  }

  // Получаем конкретный блок текстов для страницы
  // Добавляем проверку на случай, если messages === null
  const texts = messages?.newsletterUnsubscribed
  // --------------------------------------- //

  // Если тексты не загрузились, показываем заглушку или сообщение об ошибке
  if (!texts) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Ошибка / Error</h1>
        <p>
          Не удалось загрузить тексты для этой страницы. / Failed to load content for this page.
        </p>
        <Link href={`/${locale}/`} className="text-blue-600 hover:underline mt-4 inline-block">
          Вернуться на главную / Go to Homepage
        </Link>
      </div>
    )
  }

  // --- Выбираем правильную строку сообщения --- //
  const messageText = email ? texts.getMessage.replace('{email}', email) : texts.getMessageGeneric
  // ------------------------------------------ //

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">{texts.title}</h1>
      {/* Используем выбранную строку сообщения */}
      <p className="text-lg mb-2">{messageText}</p>
      <p className="text-gray-600 mb-8">{texts.noMoreEmails}</p>

      <div className="space-y-4 md:space-y-0 md:space-x-4">
        <Link
          href={`/${locale}/`}
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
        >
          {texts.resubscribeLink}
        </Link>

        <Link
          href={`/${locale}/`}
          className="inline-block px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-200"
        >
          {texts.goHome}
        </Link>
      </div>

      {email && (
        <p className="text-sm text-gray-500 mt-12">
          {texts.unsubscribedEmailLabel} {email}
        </p>
      )}
    </div>
  )
}

export default NewsletterUnsubscribedPage
