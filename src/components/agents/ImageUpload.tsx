'use client'

// FlowMasters AI Agents - Image Upload Component
// Generated with AI assistance for rapid development

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, FileText, Eye } from 'lucide-react'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface ImageUploadProps {
  onImageSelect: (imageUrl: string, file: File) => void
  onImageRemove: () => void
  selectedImage?: string
  className?: string
}

export function ImageUpload({ 
  onImageSelect, 
  onImageRemove, 
  selectedImage,
  className = '' 
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Размер файла не должен превышать 10MB')
      return
    }

    setIsUploading(true)
    
    try {
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file)
      onImageSelect(imageUrl, file)
    } catch (error) {
      logError('Error processing image:', error)
      alert('Ошибка при обработке изображения')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemoveImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage)
    }
    onImageRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (selectedImage) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img
                src={selectedImage}
                alt="Uploaded preview"
                className="w-16 h-16 object-cover rounded-lg border"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <ImageIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-900">
                  Изображение загружено
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Готово для анализа с помощью Gemini Pro Vision
              </p>
            </div>
            
            <button
              onClick={() => window.open(selectedImage, '_blank')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Просмотреть изображение"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="space-y-3">
          <div className="flex justify-center">
            {isUploading ? (
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? 'Загрузка...' : 'Загрузите изображение'}
            </p>
            <p className="text-sm text-gray-600">
              Перетащите файл сюда или нажмите для выбора
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Поддерживаемые форматы: JPG, PNG, GIF, WebP</p>
            <p>Максимальный размер: 10MB</p>
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center space-x-2 text-gray-600">
          <FileText className="w-4 h-4 text-blue-500" />
          <span>OCR распознавание текста</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <ImageIcon className="w-4 h-4 text-green-500" />
          <span>Анализ содержимого</span>
        </div>
      </div>
    </div>
  )
}