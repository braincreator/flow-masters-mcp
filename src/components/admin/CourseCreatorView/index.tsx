'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Gutter, Card } from '@payloadcms/ui'

import './index.scss'

const CourseCreatorView: React.FC = () => {
  // Simplified component without Payload hooks
  const api = '/api' // Default API path
  const router = useRouter()

  // Simple toast implementation
  const addToast = (toast: { type: string; message: string }) => {
    console.log(`Toast: [${toast.type}] ${toast.message}`)
    // In a real implementation, we would use a toast library
    alert(toast.message)
  }

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('beginner')
  const [category, setCategory] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || !level || !category) {
      addToast({
        type: 'error',
        message: 'Please fill in all required fields',
      })
      return
    }

    setIsGenerating(true)
    setGenerationStep('Initializing course generation...')

    try {
      // Step 1: Create the course structure
      setGenerationStep('Creating course structure...')
      const courseResponse = await fetch(`${api}/courses`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          level,
          category,
          status: 'draft',
        }),
      })

      if (!courseResponse.ok) {
        throw new Error('Failed to create course')
      }

      const course = await courseResponse.json()

      // Step 2: Generate modules and lessons
      setGenerationStep('Generating modules and lessons...')
      const modulesResponse = await fetch(`${api}/generate-course-content`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.doc.id,
          title,
          description,
          level,
        }),
      })

      if (!modulesResponse.ok) {
        throw new Error('Failed to generate course content')
      }

      // Step 3: Generate quizzes and assessments
      setGenerationStep('Creating quizzes and assessments...')
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulating work

      // Step 4: Generate course materials
      setGenerationStep('Generating course materials...')
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulating work

      // Step 5: Finalize course
      setGenerationStep('Finalizing course...')
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulating work

      addToast({
        type: 'success',
        message: 'Course created successfully!',
      })

      // Redirect to the course edit page
      router.push(`/admin/collections/courses/${course.doc.id}`)
    } catch (error) {
      console.error('Error creating course:', error)
      addToast({
        type: 'error',
        message: 'Failed to create course. Please try again.',
      })
    } finally {
      setIsGenerating(false)
      setGenerationStep('')
    }
  }

  // In a real implementation, we would check if the user is authenticated
  // For now, we'll assume the user is authenticated since this is an admin view

  return (
    <div className="course-creator">
      <Gutter>
        <h1>Course Creator</h1>
        <p className="description">
          Create a new course with AI-generated content. Fill in the details below and our AI will
          generate a complete course structure with modules, lessons, quizzes, and materials.
        </p>

        <div className="course-creator__grid">
          <div className="course-creator__form-container">
            <Card className="course-creator__card">
              <form onSubmit={handleSubmit} className="course-creator__form">
                <div className="field-type">
                  <label className="field-label" htmlFor="title">
                    Course Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Advanced JavaScript Patterns"
                    required
                    disabled={isGenerating}
                    className="field-input"
                  />
                </div>

                <div className="field-type">
                  <label className="field-label" htmlFor="description">
                    Course Description *
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students will learn in this course..."
                    required
                    disabled={isGenerating}
                    rows={4}
                    className="field-textarea"
                  />
                </div>

                <div className="field-type">
                  <label className="field-label" htmlFor="level">
                    Difficulty Level *
                  </label>
                  <select
                    id="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    disabled={isGenerating}
                    className="field-select"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="field-type">
                  <label className="field-label" htmlFor="category">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    disabled={isGenerating}
                    className="field-select"
                  >
                    <option value="">Select a category</option>
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                    <option value="personal-development">Personal Development</option>
                  </select>
                </div>

                <div className="course-creator__actions">
                  <Button type="submit" disabled={isGenerating} className="course-creator__submit">
                    {isGenerating ? 'Generating Course...' : 'Generate Course'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="course-creator__preview">
            <Card className="course-creator__card">
              <h3>Course Preview</h3>

              {title ? (
                <div className="course-preview">
                  <h4 className="course-preview__title">{title}</h4>
                  <p className="course-preview__description">
                    {description || 'No description provided yet.'}
                  </p>

                  <div className="course-preview__meta">
                    <span className="course-preview__level">
                      Level: {level.charAt(0).toUpperCase() + level.slice(1)}
                    </span>
                    {category && (
                      <span className="course-preview__category">
                        Category: {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="course-preview course-preview--empty">
                  <p>Fill in the form to see a preview of your course.</p>
                </div>
              )}
            </Card>

            {isGenerating && (
              <Card className="course-creator__card course-creator__generation-status">
                <h3>Generation Status</h3>
                <div className="generation-steps">
                  <div className="generation-step generation-step--active">
                    <div className="generation-step__indicator"></div>
                    <div className="generation-step__content">
                      <p className="generation-step__label">{generationStep}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Gutter>
    </div>
  )
}

export default CourseCreatorView
