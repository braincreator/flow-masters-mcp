'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Product } from '@/payload-types';
import { AddToCartButton } from '@/components/ui/AddToCartButton';

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Define Locale type directly based on payload-types.ts
export type Locale = 'en' | 'ru';

interface CoursePricingProps {
  product: Product | string | null | undefined;
  locale: Locale;
}

// Helper function to format price
const formatPrice = (amount: number, currencyCode: string, locale: string) => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0, // Adjust as needed
      maximumFractionDigits: 2, // Adjust as needed
    }).format(amount);
  } catch (error) {
    logError('Error formatting price:', error);
    // Fallback formatting
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};

export const CoursePricing: React.FC<CoursePricingProps> = ({ product, locale }) => {
  const t = useTranslations('CoursePage');

  // Handle cases where product is null, undefined, or just an ID string
  if (typeof product === 'string' || !product) {
    logWarn('CoursePricing: Product data is not fully populated.');
    return null; // Or display loading/unavailable state
  }

  // Safely access nested price data using the defined Locale type
  const priceData = product.pricing?.locales?.[locale];
  const amount = priceData?.amount;
  const currency = priceData?.currency;

  let formattedPrice = t('pricingNotAvailable');
  if (typeof amount === 'number' && currency) {
    formattedPrice = formatPrice(amount, currency, locale);
  } else {
    // Fallback if locale-specific price isn't available, try base price
    const baseAmount = product.pricing?.finalPrice ?? product.pricing?.basePrice;
    if (typeof baseAmount === 'number') {
      // Attempt formatting with a default currency (e.g., USD) or just show number
      formattedPrice = formatPrice(baseAmount, 'USD', 'en-US'); // Adjust default currency/locale as needed
      logWarn(`CoursePricing: Locale price for '${locale}' not found, using base price.`);
    } else {
       logWarn('CoursePricing: Price amount or currency is missing.');
    }
  }


  return (
    <div className="p-4 border rounded-lg shadow-md bg-card text-card-foreground">
      {/* Consider adding a title like "Get Access" or similar */}
      <p className="text-2xl font-bold mb-4">{formattedPrice}</p>
      <AddToCartButton product={product} locale={locale} />
    </div>
  );
};

export default CoursePricing;