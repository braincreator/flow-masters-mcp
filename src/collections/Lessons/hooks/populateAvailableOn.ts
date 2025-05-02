import type { CollectionBeforeChangeHook } from 'payload'
import type { Lesson } from '@/payload-types'
// We don't need date-fns here as we're just setting the date from releaseDate

export const populateAvailableOn: CollectionBeforeChangeHook<Lesson> = async ({
  data, // Incoming data for the lesson
  req,
  operation,
}) => {
  // Check if dripContent data is present (it might not be if only other fields are updated)
  const dripType = data.dripContent?.dripType
  const releaseDate = data.dripContent?.releaseDate

  // Only calculate if dripContent is being set or changed
  if (dripType) {
    if (dripType === 'specificDate' && releaseDate) {
      // For specificDate, copy the releaseDate to availableOn
      // Ensure releaseDate is a Date object or convert if necessary
      // The 'date' field type in Payload typically handles the conversion,
      // but we ensure it's a Date object for consistency if needed elsewhere.
      data.availableOn = releaseDate instanceof Date ? releaseDate : new Date(releaseDate);
    } else {
      // For 'immediate' or 'daysAfterEnrollment', the availability is relative
      // to enrollment, so we clear availableOn (or set to null/undefined).
      // The beforeRead hook handles the relative logic.
      data.availableOn = null; // Set to null to clear the date
    }
  } else if (operation === 'create' && !data.dripContent?.dripType) {
    // If creating and no drip type is specified (defaults to immediate), clear availableOn
     data.availableOn = null;
  }

  // Return the potentially modified data
  return data
}