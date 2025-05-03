'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Course } from '@/payload-types'; // Assuming Course type is available

interface CourseTimerProps {
  enrollmentStartDate?: Course['enrollmentStartDate'];
  enrollmentEndDate?: Course['enrollmentEndDate'];
}

const CourseTimer: React.FC<CourseTimerProps> = ({ enrollmentStartDate, enrollmentEndDate }) => {
  const t = useTranslations('CoursePage');
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    let futureTargetDate: Date | null = null;
    let statusMessage: string | null = null;

    const startDate = enrollmentStartDate ? new Date(enrollmentStartDate) : null;
    const endDate = enrollmentEndDate ? new Date(enrollmentEndDate) : null;

    if (endDate && endDate > now) {
      futureTargetDate = endDate;
      statusMessage = t('timerClosesIn');
    } else if (startDate && startDate > now) {
      futureTargetDate = startDate;
      statusMessage = t('timerOpensIn');
    } else if (endDate && endDate <= now) {
        statusMessage = t('timerClosed');
    } else if (startDate && startDate <= now && !endDate) {
        statusMessage = t('timerOpen');
    } else {
        statusMessage = t('timerNotSet');
    }

    setTargetDate(futureTargetDate);
    setMessage(statusMessage);

  }, [enrollmentStartDate, enrollmentEndDate]);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null); // Clear timer if no target date
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date();
      let timeLeftString = '';

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        timeLeftString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else {
        // Date has passed, update message if needed (e.g., from "closes in" to "closed")
        setTimeLeft(null); // Stop timer display
        const now = new Date();
        const startDate = enrollmentStartDate ? new Date(enrollmentStartDate) : null;
        const endDate = enrollmentEndDate ? new Date(enrollmentEndDate) : null;
        if (endDate && endDate <= now) {
            setMessage(t('timerClosed'));
        } else if (startDate && startDate <= now && !endDate) {
            setMessage(t('timerOpen'));
        }
        setTargetDate(null); // Clear target date to stop interval
        return; // Exit early
      }

      setTimeLeft(timeLeftString);
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    // Clear interval on component unmount or when targetDate changes
    return () => clearInterval(timer);

  }, [targetDate, enrollmentStartDate, enrollmentEndDate]); // Rerun effect if targetDate changes

  if (!message) {
    return null; // Render nothing if no message is set yet
  }

  return (
    <div style={{ padding: '10px', border: '1px solid #eee', margin: '10px 0', borderRadius: '5px' }}>
      <p>{message}</p>
      {timeLeft && <p style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{timeLeft}</p>}
    </div>
  );
};

export default CourseTimer;