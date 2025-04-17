'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, File, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FileUploadProps {
  onFileLoaded: (content: string) => void
  accept?: string
  maxSize?: number // в байтах
}

export function FileUpload({ onFileLoaded, accept = '.json', maxSize = 5 * 1024 * 1024 }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setError(null)
    
    if (!file) {
      setFileName(null)
      return
    }

    // Проверка размера файла
    if (maxSize && file.size > maxSize) {
      setError(`Файл слишком большой. Максимальный размер: ${formatFileSize(maxSize)}`)
      setFileName(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setFileName(file.name)

    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        
        // Проверка валидности JSON, если загружаем JSON
        if (accept.includes('json')) {
          JSON.parse(content) // Просто проверяем, что это валидный JSON
        }
        
        onFileLoaded(content)
      } catch (error) {
        setError('Неверный формат файла. Пожалуйста, загрузите корректный JSON-файл.')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setFileName(null)
      }
    }

    reader.onerror = () => {
      setError('Ошибка при чтении файла')
      setFileName(null)
    }

    reader.readAsText(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      
      <div className="flex items-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleButtonClick}
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          Загрузить файл
        </Button>
        
        {fileName && (
          <div className="flex items-center text-sm text-muted-foreground">
            <File size={16} className="mr-1" />
            {fileName}
          </div>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Вспомогательная функция для форматирования размера файла
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes'
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

export default FileUpload
