import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedLoadingIndicator from '@/components/ui/AnimatedLoadingIndicator';

// Types
interface MilestoneItem {
  id: string;
  title: string;
  status: string;
  startDate?: string;
  dueDate?: string;
}

interface TaskItem {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
}

interface ProjectDetails {
  id: string;
  name: string;
}

interface CalendarTabContentProps {
  milestones: MilestoneItem[];
  tasks: TaskItem[];
  isLoadingCalendarData: boolean;
  project: ProjectDetails;
  params: { lang: string };
  t: (key: string, params?: any) => string;
}

const CalendarTabContent: React.FC<CalendarTabContentProps> = (props) => {
  const { milestones, tasks, isLoadingCalendarData, project, params, t } = props;
  const { lang } = params;
  
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Format month name
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Weekday headers
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <motion.div
      key="calendar"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="py-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {t('calendarTab.title')}
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm transition-colors duration-150 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            {t('calendarTab.today')}
          </button>
          <div className="flex">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 bg-gray-100 text-gray-700 rounded-l border-r border-gray-300 hover:bg-gray-200 transition-colors duration-150 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 bg-gray-100 text-gray-700 rounded-r hover:bg-gray-200 transition-colors duration-150 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-sm transition-colors duration-150 rounded-l border-r ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600'
              }`}
            >
              {t('calendarTab.month')}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-sm transition-colors duration-150 rounded-r ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('calendarTab.week')}
            </button>
          </div>
        </div>
      </div>

      {isLoadingCalendarData ? (
        <div className="flex justify-center items-center py-20">
          <AnimatedLoadingIndicator size="medium" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="flex justify-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {formatMonthYear(currentDate)}
            </h2>
          </div>
          
          {/* Calendar Grid - Simplified for now */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {weekdays.map((day) => (
              <div key={day} className="py-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                {t(`calendarTab.weekdays.${day.toLowerCase()}`)}
              </div>
            ))}
          </div>
          
          <div className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {t('calendarTab.milestoneCount')}: {milestones.length}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {t('calendarTab.taskCount')}: {tasks.length}
            </p>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-blue-600 dark:text-blue-300 font-medium">
                {t('calendarTab.implementationMessage')}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t('calendarTab.calendarImplementationDescription')}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CalendarTabContent;