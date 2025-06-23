'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, Trash2, Plus, BookOpen, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface CourseNotesProps {
  courseId: string
  lessonId: string
}

interface Note {
  id: string
  content: string
  timestamp: string
  lessonId: string
}

export function CourseNotes({ courseId, lessonId }: CourseNotesProps) {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('current')

  // Load notes for the current lesson
  useEffect(() => {
    if (!user || !courseId || !lessonId) return

    const loadNotes = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        const savedNotes = localStorage.getItem(`course_notes_${user.id}_${courseId}`)
        if (savedNotes) {
          const allNotes = JSON.parse(savedNotes) as Note[]
          setNotes(allNotes)

          // Set current note to the most recent note for this lesson, if any
          const lessonNotes = allNotes.filter((note) => note.lessonId === lessonId)
          if (lessonNotes.length > 0) {
            // Sort by timestamp descending and get the most recent
            lessonNotes.sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
            )
            setCurrentNote(lessonNotes[0].content)
          } else {
            setCurrentNote('')
          }
        }
      } catch (error) {
        logError('Error loading notes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [user, courseId, lessonId])

  const saveNote = async () => {
    if (!user || !currentNote.trim()) return

    setIsSaving(true)
    try {
      // Create a new note
      const newNote: Note = {
        id: `note_${Date.now()}`,
        content: currentNote,
        timestamp: new Date().toISOString(),
        lessonId,
      }

      // Add to existing notes
      const updatedNotes = [...notes.filter((note) => note.lessonId !== lessonId), newNote]

      // In a real app, this would be an API call
      localStorage.setItem(`course_notes_${user.id}_${courseId}`, JSON.stringify(updatedNotes))

      setNotes(updatedNotes)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      logError('Error saving note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!user) return

    try {
      // Filter out the deleted note
      const updatedNotes = notes.filter((note) => note.id !== noteId)

      // In a real app, this would be an API call
      localStorage.setItem(`course_notes_${user.id}_${courseId}`, JSON.stringify(updatedNotes))

      setNotes(updatedNotes)

      // If we deleted the current lesson's note, clear the current note
      const deletedNote = notes.find((note) => note.id === noteId)
      if (deletedNote && deletedNote.lessonId === lessonId) {
        setCurrentNote('')
      }
    } catch (error) {
      logError('Error deleting note:', error)
    }
  }

  const createNewNote = () => {
    setCurrentNote('')
  }

  // Get all notes for the current course
  const courseNotes = notes.filter((note) => note.lessonId.startsWith(courseId))

  // Get notes for the current lesson
  const lessonNotes = notes.filter((note) => note.lessonId === lessonId)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Notes
        </CardTitle>
      </CardHeader>

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="flex-grow flex flex-col"
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="current">Current Lesson</TabsTrigger>
          <TabsTrigger value="all">All Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="flex-grow flex flex-col">
          <CardContent className="flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-500">
                {lessonNotes.length > 0
                  ? 'Your notes for this lesson:'
                  : 'No notes for this lesson yet'}
              </div>
              {lessonNotes.length > 0 && (
                <Button variant="ghost" size="sm" onClick={createNewNote}>
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              )}
            </div>

            <Textarea
              placeholder="Take notes for this lesson..."
              className="flex-grow resize-none mb-4"
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
            />

            <div className="flex justify-end">
              <Button onClick={saveNote} disabled={!currentNote.trim() || isSaving}>
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save Note
                  </>
                )}
              </Button>
            </div>

            {saveSuccess && (
              <Alert className="mt-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-800">
                  Note saved successfully!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </TabsContent>

        <TabsContent value="all" className="flex-grow overflow-auto">
          <CardContent>
            {courseNotes.length > 0 ? (
              <div className="space-y-4">
                {courseNotes.map((note) => (
                  <div key={note.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs text-gray-500">
                        {new Date(note.timestamp).toLocaleString()}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">{note.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>You haven't taken any notes for this course yet.</p>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
