import { Validate } from 'payload'

export const validatePricing: Validate = ({ value, siblingData }) => {
  if (!value) return true

  // Ensure all required price fields exist
  if (!value.basePrice) {
    return 'Base price is required'
  }

  // Validate price ranges
  if (value.basePrice < 0) {
    return 'Price cannot be negative'
  }

  // Validate locale-specific prices
  const requiredLocales = ['en', 'ru']
  for (const locale of requiredLocales) {
    if (!value[locale]?.amount) {
      return `Price for locale ${locale} is required`
    }
  }

  return true
}