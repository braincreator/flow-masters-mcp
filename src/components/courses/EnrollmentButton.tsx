'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { Course, User } from '@/payload-types';
import { Locale } from '@/constants';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api-client';
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import { toast } from '@/components/ui/use-toast'; // Assuming toast is set up

interface EnrollmentButtonProps {
  course: Course;
  user: User | null | undefined; // Current user state
  locale: Locale;
  // enrollmentStatus?: 'enrolled' | 'not_enrolled'; // Add later
}

const EnrollmentButton: React.FC<EnrollmentButtonProps> = ({
  course,
  user,
  locale,
  // enrollmentStatus = 'not_enrolled',
}) => {
  const t = useTranslations('EnrollmentButton');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition(); // For router refresh

  const handleEnrollFree = async () => {
    if (!user) {
      // Redirect to login if user is not logged in
      router.push(`/${locale}/login?redirect=/courses/${course.slug}`);
      return;
    }

    setIsLoading(true);
    try {
      // Assuming the API returns the new enrollment or relevant data
      const enrollment = await api.post(`/courses/${course.id}/enroll-free`);

      toast({
        title: t('enrollSuccessTitle'),
        description: t('enrollSuccessDescription'),
      });

      // Refresh the page or navigate to the course content
      startTransition(() => {
        // Option 1: Refresh current page to potentially show updated state
        router.refresh();
        // Option 2: Redirect to the first lesson (need enrollmentId and lessonId)
        // router.push(`/${locale}/dashboard/my-courses/${enrollment.id}/learn/${firstLessonId}`);
      });

    } catch (error: any) {
      logError('Free enrollment failed:', error);
      toast({
        title: t('enrollErrorTitle'),
        description: error?.message || t('enrollErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder for handling paid course enrollment
  const handleBuyCourse = () => {
    if (!user) {
      router.push(`/${locale}/login?redirect=/courses/${course.slug}`);
      return;
    }
    // Logic to add course product to cart or initiate checkout
    // Example: router.push(`/${locale}/cart?productId=${course.product?.id}`);
    toast({
      title: t('buyActionTitle'),
      description: t('buyActionDescription'), // "Redirecting to checkout..."
    });
    // Implement actual cart/checkout logic here
  };

  // Render different buttons based on access type and enrollment status (later)
  // if (enrollmentStatus === 'enrolled') {
  //   return (
  //     <Button asChild>
  //       <Link href={`/${locale}/dashboard/my-courses/...`}>{t('goToCourse')}</Link>
  //     </Button>
  //   );
  // }

  if (course.accessType === 'free') {
    return (
      <Button onClick={handleEnrollFree} disabled={isLoading || isPending}>
        {isLoading ? t('enrolling') : t('enrollFree')}
      </Button>
    );
  }

  if (course.accessType === 'paid' && course.product) {
    // Assuming 'product' field links to the purchasable product
    return (
      <Button onClick={handleBuyCourse} disabled={isLoading || isPending}>
        {/* Add price display later */}
        {t('buyCourse')}
      </Button>
    );
  }

  // Fallback or handle other access types like 'subscription' later
  return null;
};

export default EnrollmentButton;