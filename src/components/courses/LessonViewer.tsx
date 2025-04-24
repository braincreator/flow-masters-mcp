'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  PlayCircle,
  FileText,
  FileQuestion,
  Download,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/utilities/ui'

interface LessonViewerProps {
  lesson: any
  isCompleted: boolean
  onComplete: () => void
  onNext: () => void
}

export function LessonViewer({ lesson, isCompleted, onComplete, onNext }: LessonViewerProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showCompletionAlert, setShowCompletionAlert] = useState(false)

  if (!lesson) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-gray-500">Select a lesson to start learning</p>
        </CardContent>
      </Card>
    )
  }

  const handleComplete = () => {
    if (!isCompleted) {
      onComplete()
      setShowCompletionAlert(true)
      setTimeout(() => setShowCompletionAlert(false), 3000)
    }
  }

  const renderLessonContent = () => {
    const contentType = lesson.type || 'text'

    switch (contentType) {
      case 'video':
        return (
          <div className="space-y-4">
            {lesson.videoUrl ? (
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                <iframe
                  src={lesson.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
                <PlayCircle className="h-16 w-16 text-gray-400" />
              </div>
            )}

            {lesson.content && (
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
            )}
          </div>
        )

      case 'quiz':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <FileQuestion className="h-5 w-5" />
              <span className="font-medium">Quiz: Test your knowledge</span>
            </div>

            {lesson.content && (
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
            )}

            {/* Quiz questions would be rendered here */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <p className="text-sm text-gray-500">
                Quiz functionality will be implemented in a future update.
              </p>
            </div>
          </div>
        )

      case 'assignment':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Assignment</span>
            </div>

            {lesson.content && (
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
            )}

            {lesson.attachments && lesson.attachments.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Resources</h3>
                <div className="space-y-1">
                  {lesson.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4" />
                      <span>{attachment.title || `Resource ${index + 1}`}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'text':
      default:
        return (
          <div className="space-y-4">
            {lesson.content ? (
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
            ) : (
              <p>
                This is a placeholder for the lesson content. In a real application, this would
                contain the actual lesson content.
              </p>
            )}

            {lesson.externalResources && lesson.externalResources.length > 0 && (
              <div className="space-y-2 mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium">Additional Resources</h3>
                <div className="space-y-1">
                  {lesson.externalResources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{resource.title || `Resource ${index + 1}`}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>{lesson.title}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {lesson.type === 'video' && <PlayCircle className="h-4 w-4" />}
            {lesson.type === 'quiz' && <FileQuestion className="h-4 w-4" />}
            {lesson.type === 'text' && <FileText className="h-4 w-4" />}
            <span>{lesson.duration || '10 min'}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow overflow-auto pb-0">{renderLessonContent()}</CardContent>

      <CardFooter className="flex justify-between pt-4 mt-4 border-t">
        {showCompletionAlert && (
          <Alert className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-green-50 border-green-200 w-auto">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-800">
              Lesson marked as completed!
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleComplete}
          variant={isCompleted ? 'outline' : 'default'}
          className={cn(
            isCompleted &&
              'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800',
          )}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
            </>
          ) : (
            'Mark as Complete'
          )}
        </Button>

        <Button onClick={onNext} disabled={!isCompleted}>
          Next Lesson
        </Button>
      </CardFooter>
    </Card>
  )
}
