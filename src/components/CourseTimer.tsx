'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { Course } from '@/payload-types'; // Assuming Course type is available

interface CourseTimerProps {
  enrollmentStartDate?: Course['enrollmentStartDate'];
  enrollmentEndDate?: Course['enrollmentEndDate'];
}

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CourseTimer: React.FC<CourseTimerProps> = ({ enrollmentStartDate, enrollmentEndDate }) => {
  const t = useTranslations('CoursePage');
  const [timeLeft, setTimeLeft] = useState<TimeParts | null>(null);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // State to track client-side rendering

  useEffect(() => {
    setIsClient(true); // Component has mounted on the client
  }, []);

  useEffect(() => {
    if (!isClient) return; // Only run date logic on the client

    const now = new Date();
    let futureTargetDate: Date | null = null;
    let statusMessage: string | null = null;

    const startDate = enrollmentStartDate ? new Date(enrollmentStartDate) : null;
    const endDate = enrollmentEndDate ? new Date(enrollmentEndDate) : null;

    // Determine the relevant date and message
    if (endDate && endDate > now) {
      futureTargetDate = endDate;
      statusMessage = t('timerClosesIn');
    } else if (startDate && startDate > now) {
      futureTargetDate = startDate;
      statusMessage = t('timerOpensIn');
    } else if (endDate && endDate <= now) {
      statusMessage = t('timerClosed');
    } else if (startDate && startDate <= now && !endDate) {
      statusMessage = t('timerOpen'); // Enrollment is open indefinitely or end date not set
    } else {
      // No relevant dates provided or both are in the past without start date being valid
      // Don't show the timer component if dates aren't relevant
      statusMessage = null;
    }

    setTargetDate(futureTargetDate);
    setMessage(statusMessage);

  }, [enrollmentStartDate, enrollmentEndDate, t, isClient]); // Add t and isClient to dependencies

  useEffect(() => {
    if (!targetDate || !isClient) {
      setTimeLeft(null); // Clear timer if no target date or not on client
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // Time's up, update message and clear timer
        setTimeLeft(null);
        const now = new Date();
        const startDate = enrollmentStartDate ? new Date(enrollmentStartDate) : null;
        const endDate = enrollmentEndDate ? new Date(enrollmentEndDate) : null;

        if (endDate && endDate <= now) {
          setMessage(t('timerClosed'));
        } else if (startDate && startDate <= now && !endDate) {
          setMessage(t('timerOpen'));
        }
        setTargetDate(null); // Clear target date to stop interval
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timerInterval = setInterval(calculateTimeLeft, 1000);

    // Clear interval on component unmount or when targetDate changes
    return () => clearInterval(timerInterval);

  }, [targetDate, enrollmentStartDate, enrollmentEndDate, t, isClient]); // Add t and isClient

  // Don't render if no message (e.g., dates not relevant or not yet calculated on client)
  if (!message || !isClient) {
    return null;
  }

  // Render static message if timer is not active (e.g., "Open" or "Closed")
  if (!timeLeft) {
    return (
      <div className="bg-warning/10 border-l-4 border-warning text-warning-foreground p-4 my-6" role="alert">
        <p className="font-bold">{message}</p>
      </div>
    );
  }

  // Render countdown timer
  return (
    <div className="bg-destructive text-destructive-foreground p-4 my-6 rounded-lg shadow-md text-center">
      <p className="text-lg font-semibold mb-2">{message}</p>
      <div className="flex justify-center space-x-2 sm:space-x-4">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center bg-destructive-foreground/10 p-2 rounded min-w-[50px] sm:min-w-[60px]">
            <span className="text-xl sm:text-2xl font-bold">{value.toString().padStart(2, '0')}</span>
            <span className="text-xs uppercase">{t(`timerUnit${unit.charAt(0).toUpperCase() + unit.slice(1)}` as any)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseTimer;