import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { formatDate } from '@/utilities/formatDate'
import AnimatedLoadingIndicator from '@/components/ui/AnimatedLoadingIndicator'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Types
interface FeedbackItem {
  id: string
  title: string
  rating: number
  comment: string
  author: {
    id: string
    name?: string
    email: string
  }
  createdAt: string
  feedbackType: string
  isPublic: boolean
}

interface ProjectDetails {
  id: string
  name: string
}

interface FeedbackTabContentProps {
  feedback: FeedbackItem[]
  isLoadingFeedback: boolean
  handleCreateFeedback: (feedbackData: {
    title: string
    rating: number
    comment: string
    feedbackType: string
    isPublic: boolean
  }) => Promise<void>
  project: ProjectDetails
  lang: string
  t: (key: string, params?: any) => string
}

const FeedbackTabContent: React.FC<FeedbackTabContentProps> = (props) => {
  const { feedback, isLoadingFeedback, handleCreateFeedback, project, lang, t } = props

  // Add common translations for accessing common keys like 'cancel'
  const commonT = useTranslations('common')

  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    rating: 5,
    comment: '',
    feedbackType: 'general',
    isPublic: false,
  })

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setFormData({ ...formData, [name]: checkbox.checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await handleCreateFeedback({
        ...formData,
        rating: Number(formData.rating),
      })

      // Reset form after successful submission
      setFormData({
        title: '',
        rating: 5,
        comment: '',
        feedbackType: 'general',
        isPublic: false,
      })

      setIsFeedbackFormOpen(false)
    } catch (error) {
      logError('Error submitting feedback:', error)
    }
  }

  // Render rating stars
  const renderStars = (rating: number) => {
    const stars = []

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>,
      )
    }

    return <div className="flex">{stars}</div>
  }

  // Get feedback type label
  const getFeedbackTypeLabel = (type: string) => {
    switch (type) {
      case 'general':
        return t('feedbackTab.type.general')
      case 'milestone':
        return t('feedbackTab.type.milestone')
      case 'collaboration':
        return t('feedbackTab.type.collaboration')
      case 'result':
        return t('feedbackTab.type.result')
      default:
        return type
    }
  }

  return (
    <motion.div
      key="feedback"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="py-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {t('feedbackTab.title')}
        </h3>
        <button
          onClick={() => setIsFeedbackFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors duration-150 shadow-sm hover:shadow"
        >
          {t('feedbackTab.addFeedbackButton')}
        </button>
      </div>

      {isLoadingFeedback ? (
        <div className="flex justify-center items-center py-10">
          <AnimatedLoadingIndicator size="medium" />
        </div>
      ) : feedback && feedback.length > 0 ? (
        <div className="space-y-6">
          {feedback.map((feedbackItem) => (
            <motion.div
              key={feedbackItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-md font-semibold">{feedbackItem.title}</h4>
                {feedbackItem.isPublic && (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                    {t('feedbackTab.public')}
                  </span>
                )}
              </div>

              <div className="flex items-center mb-3">
                {renderStars(feedbackItem.rating)}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {feedbackItem.rating}/5
                </span>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {feedbackItem.comment}
              </p>

              <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <span>{feedbackItem.author.name || feedbackItem.author.email}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(feedbackItem.createdAt, lang)}</span>
                </div>

                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                  {getFeedbackTypeLabel(feedbackItem.feedbackType)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {t('feedbackTab.noFeedbackTitle')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('feedbackTab.noFeedbackDescription')}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsFeedbackFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('feedbackTab.addFeedbackButton')}
            </button>
          </div>
        </div>
      )}

      {/* Feedback Form Modal */}
      {isFeedbackFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              {t('feedbackTab.addFeedbackTitle')}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('feedbackTab.feedbackTitle')}
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('feedbackTab.rating')}
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    name="rating"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full max-w-xs"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">{formData.rating}/5</span>
                </div>
                <div className="mt-1">{renderStars(Number(formData.rating))}</div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('feedbackTab.comment')}
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('feedbackTab.feedbackType')}
                </label>
                <select
                  name="feedbackType"
                  value={formData.feedbackType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="general">{t('feedbackTab.type.general')}</option>
                  <option value="milestone">{t('feedbackTab.type.milestone')}</option>
                  <option value="collaboration">{t('feedbackTab.type.collaboration')}</option>
                  <option value="result">{t('feedbackTab.type.result')}</option>
                </select>
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPublic"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  {t('feedbackTab.makePublic')}
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFeedbackFormOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  {commonT('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('feedbackTab.submitFeedback')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

export default FeedbackTabContent
