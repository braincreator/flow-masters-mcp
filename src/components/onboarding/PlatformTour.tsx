import React, { useState, useEffect } from 'react';
// NOTE: Ensure 'react-joyride' and potentially '@types/react-joyride' are installed
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useAuth } from '@/hooks/useAuth'; // Use the actual auth hook
import { useTranslations } from '@/hooks/useTranslations';
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// import { updateUserProfile } from '@/lib/api/users'; // Placeholder for API call

interface PlatformTourProps {
  startAutomatically?: boolean; // Optional prop to trigger tour
}

// TODO: Define the steps for the tour based on the design wireframes
// Each step typically needs a target selector (CSS selector), content, and placement.
// Example structure if using react-joyride:
// Define step structure with translation keys
// Actual content will be fetched using t() inside the component
const TOUR_STEP_KEYS: Omit<Step, 'content'>[] = [
  {
    target: '.dashboard-welcome', // Example selector - adjust based on actual dashboard component
    // content: 'onboarding.tour.step1.content', // Key for translation
    placement: 'bottom',
    title: 'onboarding.tour.step1.title', // Key for title translation
    locale: { skip: 'onboarding.tour.skipButton' } // Key for skip button
  },
  {
    target: '.course-list-container', // Example selector
    // content: 'onboarding.tour.step2.content',
    placement: 'right',
    title: 'onboarding.tour.step2.title',
    locale: { skip: 'onboarding.tour.skipButton' }
  },
  {
    target: '.user-menu-button', // Example selector for user profile access
    // content: 'onboarding.tour.step3.content',
    placement: 'left',
    title: 'onboarding.tour.step3.title',
    locale: { skip: 'onboarding.tour.skipButton', last: 'onboarding.tour.finishButton' } // Keys for last step buttons
  },
];


export const PlatformTour: React.FC<PlatformTourProps> = ({ startAutomatically = false }) => {
  const [runTour, setRunTour] = useState(false);
  const { user } = useAuth(); // Get user data
  // Assuming useTranslations requires a namespace and returns the object
  const translations = useTranslations('onboarding'); // Fetch onboarding translations

  // Map keys to actual translated steps, accessing properties from the translations object
  // Ensure the structure matches your translation JSON (e.g., onboarding.tour.step1.title)
  const tourSteps: Step[] = TOUR_STEP_KEYS.map(step => {
      const titleKey = step.title as string; // e.g., 'onboarding.tour.step1.title'
      const skipKey = step.locale?.skip as string; // e.g., 'onboarding.tour.skipButton'
      const lastKey = step.locale?.last as string || 'onboarding.tour.finishButton'; // e.g., 'onboarding.tour.finishButton'

      // Helper to safely access nested properties (adjust based on actual t object structure)
      const getTranslation = (key: string, defaultVal = key) => {
          const keys = key.split('.'); // e.g., ['onboarding', 'tour', 'step1', 'title']
          // Assuming the namespace 'onboarding' is already handled by useTranslations
          let current = translations;
          for (let i = 0; i < keys.length; i++) {
              // Check if current is an object and has the key
              if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, keys[i])) {
                 // @ts-ignore // Ignore implicit any for dynamic access
                 current = current[keys[i]];
              } else {
                  return defaultVal; // Key path not found, return default
              }
          }
          return typeof current === 'string' ? current : defaultVal; // Return string or default
      };


      return {
          ...step,
          // Use title key for content for simplicity, adjust if needed
          content: getTranslation(titleKey),
          title: getTranslation(titleKey),
          locale: {
              skip: <>{getTranslation(skipKey)}</>,
              last: <>{getTranslation(lastKey)}</>,
          }
      };
  });


  useEffect(() => {
    // Run tour if triggered by prop OR if user hasn't completed onboarding/tour
    // TODO: Verify the correct user property for onboarding/tour completion status (e.g., user.onboardingComplete)
    const shouldStart = startAutomatically || (user && !user.onboardingComplete);
    // Add a check to prevent starting if essential target elements aren't mounted yet (optional but good practice)
    // For simplicity, we assume elements are ready when this component mounts.
    if (shouldStart) {
        // Small delay to ensure target elements might be rendered
        const timer = setTimeout(() => setRunTour(true), 500);
        return () => clearTimeout(timer);
    } else {
        setRunTour(false);
    }
  }, [user, startAutomatically]);

  const handleTourCallback = async (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      // TODO: Implement API call to update user profile (mark tour as completed)
      // try {
      //   if (user) {
      //     await updateUserProfile(user.id, { hasCompletedOnboarding: true }); // Or hasCompletedTour: true
      //   }
      // } catch (error) {
      //   logError("Failed to update user tour status:", error);
      // }
    }
    // Handle other statuses like ERROR if needed
  };

  // Render Joyride component if runTour is true
  return (
    <>
      {runTour && (
        <Joyride
          steps={tourSteps}
          run={runTour}
          continuous
          showProgress
          showSkipButton
          callback={handleTourCallback}
          styles={{
            options: {
              zIndex: 10000, // Ensure tour is above other elements
              primaryColor: '#007bff', // Example primary color
            },
            tooltipContainer: {
              textAlign: 'left',
            },
            buttonNext: {
              backgroundColor: '#007bff',
            },
            buttonBack: {
              marginRight: 10,
            },
          }}
          // Pass translated strings for buttons if not handled by step locale
          // locale={{
          //   back: t('onboarding.tour.backButton'),
          //   close: t('onboarding.tour.closeButton'),
          //   last: t('onboarding.tour.finishButton'),
          //   next: t('onboarding.tour.nextButton'),
          //   skip: t('onboarding.tour.skipButton'),
          // }}
        />
      )}
    </>
  );
};

export default PlatformTour;