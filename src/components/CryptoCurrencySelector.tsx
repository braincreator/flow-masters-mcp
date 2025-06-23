'use client'

import React from 'react'
import { Locale } from '@/constants'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bitcoin, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

// Translations for the component
const translations = {
  en: {
    selectCryptoCurrency: 'Select cryptocurrency',
    currencies: {
      BTC: 'Bitcoin (BTC)',
      ETH: 'Ethereum (ETH)',
      USDT: 'Tether (USDT)',
      USDC: 'USD Coin (USDC)',
      DAI: 'Dai (DAI)',
    },
  },
  ru: {
    selectCryptoCurrency: 'Выберите криптовалюту',
    currencies: {
      BTC: 'Биткоин (BTC)',
      ETH: 'Эфириум (ETH)',
      USDT: 'Tether (USDT)',
      USDC: 'USD Coin (USDC)',
      DAI: 'Dai (DAI)',
    },
  },
}

interface CryptoCurrencySelectorProps {
  value: string
  onChange: (value: string) => void
  locale?: Locale
  className?: string
  supportedCurrencies?: string // Comma-separated list of supported currencies
}

const defaultCurrencies = ['BTC', 'ETH', 'USDT', 'USDC', 'DAI']

export default function CryptoCurrencySelector({
  value,
  onChange,
  locale = 'en',
  className,
  supportedCurrencies = 'ETH,USDT,DAI',
}: CryptoCurrencySelectorProps) {
  // Get translations for the current locale
  const t = translations[locale as keyof typeof translations] || translations.en

  // Parse the comma-separated string into an array
  const cryptoCurrencies = supportedCurrencies
    ? supportedCurrencies.split(',').map((c) => c.trim())
    : defaultCurrencies

  const getCurrencyIcon = (currency: string) => {
    switch (currency.toUpperCase()) {
      case 'BTC':
        return <Bitcoin className="h-4 w-4 mr-2" />
      default:
        return <Coins className="h-4 w-4 mr-2" />
    }
  }

  const getCurrencyLabel = (currency: string) => {
    const currencyKey = currency.toUpperCase() as keyof typeof t.currencies
    return t.currencies[currencyKey] || currency
  }

  return (
    <div className={cn('w-full', className)}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t.selectCryptoCurrency} />
        </SelectTrigger>
        <SelectContent>
          {cryptoCurrencies.map((currency) => (
            <SelectItem key={currency} value={currency}>
              <div className="flex items-center">
                {getCurrencyIcon(currency)}
                {getCurrencyLabel(currency)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
