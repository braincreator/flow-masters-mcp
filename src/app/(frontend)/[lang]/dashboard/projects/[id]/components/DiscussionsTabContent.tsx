import React from 'react'
import { motion } from 'framer-motion'
import { formatDate } from '@/utilities/formatDate'
import Link from 'next/link' // Added for potential links in messages
import AnimatedLoadingIndicator from '@/components/ui/AnimatedLoadingIndicator' // Assuming this path

// --- Copied/defined types - consider moving to a shared types file ---
interface MessageAttachment {
  id: string
  filename: string
  url: string
}

interface MessageItem {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name?: string
    email: string
  }
  isSystemMessage: boolean
  attachments?: MessageAttachment[]
}

interface ProjectDetails {
  id: string
  // Add other necessary ProjectDetails fields if used
}
// --- End of types ---

interface DiscussionsTabContentProps {
  messages: MessageItem[]
  isLoadingMessages: boolean
  newMessage: string
  setNewMessage: (message: string) => void
  handleSendMessage: () => Promise<void> // Adjusted for async
  project: ProjectDetails // Ensure this has at least 'id'
  lang: string
  t: (key: string, params?: any) => string
  // Note: File attachment functionality for messages is deferred
}

const DiscussionsTabContent: React.FC<DiscussionsTabContentProps> = ({
  messages,
  isLoadingMessages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  project, // project prop is available but not directly used in the JSX moved so far
  lang,
  t,
}) => {
  return (
    <motion.div
      key="discussions"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="py-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        {t('discussionsTab.title')}
      </h3>

      <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center py-10">
            <AnimatedLoadingIndicator size="medium" />
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-lg shadow ${
                message.isSystemMessage
                  ? 'bg-yellow-50 dark:bg-yellow-800 border-l-4 border-yellow-400 dark:border-yellow-600'
                  : 'bg-white dark:bg-gray-800 border dark:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {message.author?.name || message.author?.email || t('discussionsTab.systemUser')}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(message.createdAt, lang)}
                </span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                {message.content}
              </p>
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {t('discussionsTab.attachments')}:
                  </p>
                  <ul className="space-y-1">
                    {message.attachments.map((file) => (
                      <li key={file.id} className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-1.5 text-blue-500 dark:text-blue-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          ></path>
                        </svg>
                        <Link
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline truncate"
                          title={file.filename}
                        >
                          {file.filename}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))
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
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {t('discussionsTab.noMessagesTitle')}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('discussionsTab.noMessagesDescription')}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg p-4 shadow">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t('discussionsTab.newMessagePlaceholder')}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
          rows={3}
        />
        <div className="flex justify-between items-center mt-3">
          <button
            type="button"
            className="flex items-center text-sm text-gray-600 px-3 py-1.5 border rounded-md hover:bg-gray-50 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600 transition-colors"
            disabled // File attachment deferred
            title={t('discussionsTab.attachFileTooltip')} // Tooltip for disabled button
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              ></path>
            </svg>
            {t('discussionsTab.attachFileButton')}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoadingMessages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 transition-colors duration-150 shadow-sm hover:shadow"
          >
            {isLoadingMessages
              ? t('discussionsTab.sendingButton')
              : t('discussionsTab.sendMessageButton')}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default DiscussionsTabContent
