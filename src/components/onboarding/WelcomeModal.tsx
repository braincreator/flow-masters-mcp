import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth' // Use the actual auth hook
import { useTranslations } from 'next-intl'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// import { updateUserProfile } from '@/lib/api/users'; // Placeholder for API call

interface WelcomeModalProps {
  onClose: () => void // Callback when the modal is closed
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth() // Get user data from the hook
  const t = useTranslations() // Initialize translations hook

  useEffect(() => {
    // Show modal only if the user exists and hasn't completed onboarding
    // Assuming 'hasCompletedOnboarding' is the flag on the user object
    if (user && !user.hasCompletedOnboarding) {
      setIsOpen(true)
    } else {
      setIsOpen(false) // Ensure it's closed otherwise
    }
  }, [user]) // Re-run effect when user data changes

  const handleClose = async () => {
    setIsOpen(false)
    // TODO: Implement API call to update user profile
    // try {
    //   if (user) {
    //     await updateUserProfile(user.id, { hasCompletedOnboarding: true }); // Example API call
    //   }
    // } catch (error) {
    //   logError("Failed to update user onboarding status:", error);
    //   // Handle error appropriately, maybe show a toast notification
    // }
    onClose() // Call the passed onClose handler
  }

  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {/* Example translation keys: onboarding.welcome.title, onboarding.welcome.description */}
          <DialogTitle>{t('onboarding.welcome.title')}</DialogTitle>
          <DialogDescription>{t('onboarding.welcome.description')}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {/* Example translation key: onboarding.welcome.explore */}
          <p>{t('onboarding.welcome.explore')}</p>
        </div>
        <DialogFooter>
          {/* Example translation key: onboarding.welcome.getStartedButton */}
          <Button onClick={handleClose}>{t('onboarding.welcome.getStartedButton')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default WelcomeModal
