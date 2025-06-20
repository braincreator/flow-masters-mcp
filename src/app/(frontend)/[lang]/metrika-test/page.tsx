import { YandexMetrikaTest } from '@/components/YandexMetrikaTest'
import { Locale } from '@/constants'

interface MetrikaTestPageProps {
  params: {
    lang: Locale
  }
}

export default async function MetrikaTestPage({ params }: MetrikaTestPageProps) {
  const { lang } = await Promise.resolve(params)

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          {lang === 'ru' ? 'Тест Яндекс.Метрики' : 'Yandex Metrika Test'}
        </h1>
        
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">
            {lang === 'ru' ? 'Инструкции:' : 'Instructions:'}
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              {lang === 'ru' 
                ? 'Откройте консоль браузера (F12) для просмотра логов метрики'
                : 'Open browser console (F12) to view metrika logs'
              }
            </li>
            <li>
              {lang === 'ru'
                ? 'Проверьте статус загрузки счетчика'
                : 'Check the counter loading status'
              }
            </li>
            <li>
              {lang === 'ru'
                ? 'Используйте кнопки ниже для тестирования событий'
                : 'Use buttons below to test events'
              }
            </li>
          </ul>
        </div>

        <YandexMetrikaTest />
        
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            {lang === 'ru' ? 'Что проверить:' : 'What to check:'}
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              {lang === 'ru'
                ? 'Статус должен показывать "Loaded" если метрика работает'
                : 'Status should show "Loaded" if metrika is working'
              }
            </li>
            <li>
              {lang === 'ru'
                ? 'В консоли должны появляться сообщения о загрузке метрики'
                : 'Console should show metrika loading messages'
              }
            </li>
            <li>
              {lang === 'ru'
                ? 'События должны отправляться без ошибок'
                : 'Events should be sent without errors'
              }
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: MetrikaTestPageProps) {
  const { lang } = await Promise.resolve(params)
  
  return {
    title: lang === 'ru' ? 'Тест Яндекс.Метрики' : 'Yandex Metrika Test',
    description: lang === 'ru' 
      ? 'Страница для тестирования работы Яндекс.Метрики'
      : 'Page for testing Yandex Metrika functionality',
  }
}
