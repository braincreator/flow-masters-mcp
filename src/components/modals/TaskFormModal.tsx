import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: { 
    title: string 
    description?: string 
    status?: string
  }) => Promise<void>
  initialData?: {
    title?: string
    description?: string
    status?: string
  }
  projectId: string
}

// Компонент модального окна для создания/редактирования задачи
const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  projectId,
}) => {
  const t = useTranslations('TaskForm')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    status: initialData.status || 'new',
  })
  const [formError, setFormError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация формы
    if (!formData.title.trim()) {
      setFormError(t('titleRequired'))
      return
    }
    
    try {
      setIsSubmitting(true)
      setFormError(null)
      
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
      })
      
      onClose() // Закрываем модальное окно после успешной отправки
    } catch (error) {
      console.error('Error submitting task:', error)
      setFormError(t('submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Закрытие модального окна при клике на backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-lg font-medium">
            {initialData.title ? t('editTask') : t('createTask')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {formError}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              {t('title')} *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {initialData.title && (
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                {t('status')}
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">{t('statusNew')}</option>
                <option value="in_progress">{t('statusInProgress')}</option>
                <option value="completed">{t('statusCompleted')}</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white ${
                isSubmitting 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('submitting') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskFormModal 