export const validateProductFields = (data: any): string[] => {
  const errors: string[] = []
  const { productType } = data

  // Common validations
  if (!data.title) {
    errors.push('Title is required')
  }

  if (!data.pricing?.basePrice) {
    errors.push('Base price is required')
  }

  // Type-specific validations
  switch (productType) {
    case 'digital':
      if (!data.digitalContent?.downloadUrl) {
        errors.push('Download URL is required for digital products')
      }
      break

    case 'subscription':
      if (!data.pricing?.recurringPrice) {
        errors.push('Recurring price is required for subscription products')
      }
      if (!data.pricing?.interval) {
        errors.push('Billing interval is required for subscription products')
      }
      break

    case 'service':
      if (!data.serviceDetails?.duration) {
        errors.push('Duration is required for service products')
      }
      if (!data.serviceDetails?.location) {
        errors.push('Location type is required for service products')
      }
      break

    case 'access':
      if (!data.accessDetails?.features?.length) {
        errors.push('At least one feature must be selected for access products')
      }
      break
  }

  return errors
}