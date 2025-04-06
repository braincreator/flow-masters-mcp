'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// Предполагаем наличие базового компонента Layout или стилей
// import Layout from '@/components/Layout' 

const NewsletterUnsubscribedPage: React.FC = () => {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const locale = searchParams.get('locale') || 'ru' // Получаем локаль или дефолт

  const texts = {
    ru: {
      title: 'Вы успешно отписаны',
      message: email
        ? `Адрес ${email} был успешно удален из нашей рассылки.`
        : 'Вы успешно отписались от нашей рассылки.',
      noMoreEmails: 'Вы больше не будете получать от нас письма с новостями и предложениями.',
      resubscribePrompt: 'Если это была ошибка, вы можете подписаться снова в любой момент.',
      resubscribeLink: 'Подписаться снова',
      goHome: 'Вернуться на главную',
    },
    en: {
      title: 'Successfully Unsubscribed',
      message: email
        ? `The address ${email} has been successfully removed from our mailing list.`
        : 'You have successfully unsubscribed from our newsletter.',
      noMoreEmails: 'You will no longer receive news and offers from us.',
      resubscribePrompt: 'If this was a mistake, you can subscribe again at any time.',
      resubscribeLink: 'Subscribe again',
      goHome: 'Go to Homepage',
    },
  }

  // Выбираем тексты на основе локали
  const currentTexts = texts[locale as keyof typeof texts] || texts.ru

  return (
    // Обертка в Layout, если он есть
    // <Layout>
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">{currentTexts.title}</h1>
      <p className="text-lg mb-2">{currentTexts.message}</p>
      <p className="text-gray-600 mb-8">{currentTexts.noMoreEmails}</p>

      <div className="space-y-4 md:space-y-0 md:space-x-4">
        {/* Ссылка на главную страницу или раздел подписки */}
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
        >
          {currentTexts.resubscribeLink}
        </Link>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-200"
        >
          {currentTexts.goHome}
        </Link>
      </div>
      
      {email && (
          <p className="text-sm text-gray-500 mt-12">
            {locale === 'ru' ? 'Отписанный email:' : 'Unsubscribed email:'} {email}
          </p>
      )}
    </div>
    // </Layout>
  )
}

export default NewsletterUnsubscribedPage 