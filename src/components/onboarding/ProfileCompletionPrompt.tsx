import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Assuming Next.js for routing
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Terminal } from 'lucide-react'; // Example icon
import { useAuth } from '@/hooks/useAuth'; // Use the actual auth hook
import { useTranslations } from '@/hooks/useTranslations';

interface ProfileCompletionPromptProps {
  // Add any necessary props, e.g., specific fields missing
}

export const ProfileCompletionPrompt: React.FC<ProfileCompletionPromptProps> = (props) => {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth(); // Get user data
  const t = useTranslations(); // Initialize translations hook
  const storageKey = 'profilePromptDismissed';

  useEffect(() => {
    // Check if user exists, profile is incomplete, and prompt hasn't been dismissed recently
    const dismissed = localStorage.getItem(storageKey);
    // Basic check: Assume profile is incomplete if firstName or lastName is missing
    // Adjust this logic based on actual required profile fields
    const isProfileIncomplete = user && (!user.firstName || !user.lastName);

    if (isProfileIncomplete && !dismissed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user]); // Re-run effect when user data changes

  const handleDismiss = () => {
    setIsVisible(false);
    // Set a flag in local storage to hide for the current session (or longer if needed)
    localStorage.setItem(storageKey, 'true');
    // Alternatively, use sessionStorage for session-only dismissal
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Alert className="mb-4 border-blue-500 text-blue-700">
      <Terminal className="h-4 w-4 stroke-blue-500" /> {/* Icon remains */}
      {/* Example translation keys: onboarding.profilePrompt.title, onboarding.profilePrompt.description */}
      <AlertTitle className="font-semibold text-blue-800">{t('onboarding.profilePrompt.title')}</AlertTitle>
      <AlertDescription>
        {t('onboarding.profilePrompt.description')}
      </AlertDescription>
      <div className="mt-3 flex gap-2">
        <Link href="/account/profile" passHref> {/* Adjust link as needed */}
          {/* Example translation key: onboarding.profilePrompt.goToProfileButton */}
          <Button variant="outline" size="sm" className="border-blue-500 text-blue-700 hover:bg-blue-50">
            {t('onboarding.profilePrompt.goToProfileButton')}
          </Button>
        </Link>
        {/* Example translation key: onboarding.profilePrompt.dismissButton */}
        <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-blue-600 hover:bg-blue-50">
          {t('onboarding.profilePrompt.dismissButton')}
        </Button>
      </div>
    </Alert>
  );
};

export default ProfileCompletionPrompt;