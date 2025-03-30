interface Dictionary {
  payment: {
    success: string
    error: string
    processing: string
  }
  // Добавьте другие разделы словаря, если нужно
}

const dictionaries: Record<string, Dictionary> = {
  en: {
    payment: {
      success: 'Payment successful!',
      error: 'Payment failed',
      processing: 'Processing payment...',
    },
  },
  ru: {
    payment: {
      success: 'Оплата успешна!',
      error: 'Ошибка оплаты',
      processing: 'Обработка платежа...',
    },
  },
}

export async function getDictionary(lang: string): Promise<Dictionary> {
  // Используйте язык по умолчанию, если запрошенный язык не поддерживается
  return dictionaries[lang] || dictionaries['en']
}
