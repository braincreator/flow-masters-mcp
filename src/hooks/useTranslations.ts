const translations = {
  en: {
    products: {
      inStock: 'In Stock',
      instantDelivery: 'Instant Delivery',
      autoRenewal: 'Auto Renewal',
      relatedProducts: 'You may also like',
    },
    productDetails: {
      features: 'Features',
      billingInterval: 'Billing Interval',
      inStock: 'In Stock',
    },
    sharing: {
      share: 'Share',
      copyLink: 'Copy link',
      linkCopied: 'Link copied to clipboard',
      shareVia: 'Share via',
    },
  },
  ru: {
    products: {
      inStock: 'В наличии',
      instantDelivery: 'Мгновенная доставка',
      autoRenewal: 'Автопродление',
      relatedProducts: 'Вам также может понравиться',
    },
    productDetails: {
      features: 'Характеристики',
      billingInterval: 'Интервал оплаты',
      inStock: 'В наличии',
    },
    sharing: {
      share: 'Поделиться',
      copyLink: 'Копировать ссылку',
      linkCopied: 'Ссылка скопирована в буфер обмена',
      shareVia: 'Поделиться через',
    },
  },
}

export const useLegacyTranslations = (lang: string) => {
  return translations[lang as keyof typeof translations] || translations.en
}
