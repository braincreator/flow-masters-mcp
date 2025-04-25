import { NextResponse } from 'next/server'
import { DEFAULT_FORMATS, FALLBACK_RATES } from '@/utilities/formatPrice'

// Настройки кеширования
export const dynamic = 'force-dynamic' // не кешировать
// Или можно включить кеширование на определенное время:
// export const revalidate = 3600 // обновлять кеш каждый час

// API Route: GET /api/currency-settings
export async function GET() {
  console.log('API /currency-settings: started request')
  try {
    // Импортируем getPayloadClient только на сервере (API routes всегда выполняются на сервере)
    console.log('API /currency-settings: importing getPayloadClient')
    const { getPayloadClient } = await import('@/utilities/payload/index')

    // Получаем данные из Payload CMS
    console.log('API /currency-settings: calling getPayloadClient')
    const payload = await getPayloadClient()

    // Получаем настройки валют
    console.log('API /currency-settings: fetching currency-settings')
    const currencySettings = await payload.findGlobal({
      slug: 'currency-settings',
    })

    // Получаем курсы обмена
    console.log('API /currency-settings: fetching exchange-rate-settings')
    const exchangeRateSettings = await payload.findGlobal({
      slug: 'exchange-rate-settings',
    })

    console.log(
      'API /currency-settings: settings received:',
      'currencySettings:',
      currencySettings ? 'ok' : 'null',
      'exchangeRateSettings:',
      exchangeRateSettings ? 'ok' : 'null',
    )

    const result = {
      localeSettings: { ...DEFAULT_FORMATS },
      baseCurrency: 'USD',
      rates: { ...FALLBACK_RATES },
    }

    // Обрабатываем информацию о валютах из currency-settings
    if (currencySettings) {
      console.log('API /currency-settings: processing currency settings')

      // Получаем базовую валюту
      if (currencySettings.baseCurrency) {
        result.baseCurrency = currencySettings.baseCurrency
        console.log('API /currency-settings: base currency:', result.baseCurrency)
      }

      // Обрабатываем настройки локализации
      if (currencySettings.localeDefaults && Array.isArray(currencySettings.localeDefaults)) {
        console.log(
          'API /currency-settings: processing locales, count:',
          currencySettings.localeDefaults.length,
        )
        const newLocaleSettings: Record<string, any> = {}

        currencySettings.localeDefaults.forEach((item: any) => {
          if (item.locale && item.currency && item.format) {
            newLocaleSettings[item.locale] = {
              currency: item.currency,
              format: {
                minimumFractionDigits:
                  typeof item.format.decimalPlaces === 'string'
                    ? parseInt(item.format.decimalPlaces, 10)
                    : 2,
                maximumFractionDigits:
                  typeof item.format.decimalPlaces === 'string'
                    ? parseInt(item.format.decimalPlaces, 10)
                    : 2,
              },
            }
          }
        })

        if (Object.keys(newLocaleSettings).length > 0) {
          result.localeSettings = newLocaleSettings
        }
      }
    }

    // Обрабатываем курсы валют из exchange-rate-settings
    if (
      exchangeRateSettings &&
      exchangeRateSettings.rates &&
      Array.isArray(exchangeRateSettings.rates)
    ) {
      console.log(
        'API /currency-settings: processing exchange rates, count:',
        exchangeRateSettings.rates.length,
      )

      exchangeRateSettings.rates.forEach((rate: any) => {
        if (rate.fromCurrency && rate.toCurrency && typeof rate.rate === 'number') {
          result.rates[`${rate.fromCurrency}_${rate.toCurrency}`] = rate.rate
        }
      })
    }

    console.log('API /currency-settings: successfully processed, returning result')
    // Возвращаем успешный ответ
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'max-age=3600',
      },
    })
  } catch (error) {
    console.error('API /currency-settings: Error fetching currency settings:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch currency settings',
        localeSettings: DEFAULT_FORMATS,
        baseCurrency: 'USD',
        rates: FALLBACK_RATES,
      },
      { status: 500 },
    )
  }
}
