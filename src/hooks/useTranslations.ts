const translations = {
  en: {
    products: {
      inStock: 'In Stock',
      instantDelivery: 'Instant Delivery',
      autoRenewal: 'Auto Renewal'
    },
    productDetails: {
      features: 'Features',
      billingInterval: 'Billing Interval',
      inStock: 'In Stock'
    }
  },
  ru: {
    products: {
      inStock: 'В наличии',
      instantDelivery: 'Мгновенная доставка',
      autoRenewal: 'Автопродление'
    },
    productDetails: {
      features: 'Характеристики',
      billingInterval: 'Интервал оплаты',
      inStock: 'В наличии'
    }
  }
}

export const useTranslations = (lang: string) => {
  return translations[lang as keyof typeof translations] || translations.en
}
