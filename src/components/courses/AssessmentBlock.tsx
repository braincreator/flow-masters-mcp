'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'
// import { RichText } from '@/components/RichText'; // Placeholder for RichText component

interface Option {
  text: string
  isCorrect?: boolean | null
  feedback?: string | null
  id?: string | null
}

interface Question {
  questionText: any // Assuming Lexical JSON format
  questionType: 'singleChoice' // Start with single choice
  options?: Option[] | null
  points?: number | null
  feedbackForAll?: any // Assuming Lexical JSON format
  id?: string | null
}

interface AssessmentBlockProps {
  questions: Question[]
  lessonId: string
  onAssessmentComplete: (isCorrect: boolean, score?: number) => void // Callback on completion
}

export function AssessmentBlock({ questions, lessonId, onAssessmentComplete }: AssessmentBlockProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState<string | null>(null) // State for specific feedback
  const t = useTranslations() // Initialize translations hook (assuming it doesn't need namespace here, or adjust if needed)

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswerSelect = (value: string) => {
    if (!isSubmitted) {
      setSelectedAnswer(value)
    }
  }

  const handleSubmit = () => {
    // Add check for currentQuestion existence
    if (!currentQuestion || !selectedAnswer || !currentQuestion.options) return

    // Use non-null assertion (!) since we checked currentQuestion above
    const selectedOption = currentQuestion!.options!.find(opt => opt.id === selectedAnswer)
    const correct = selectedOption?.isCorrect ?? false
    setIsCorrect(correct)
    setIsSubmitted(true)
    // Use non-null assertion (!)
    setShowFeedback(selectedOption?.feedback || currentQuestion!.feedbackForAll || null) // Show specific or general feedback

    let updatedScore = score;
    if (correct) {
      // Use non-null assertion (!)
      updatedScore = score + (currentQuestion!.points || 1);
      setScore(updatedScore);
    }

    // If it's the last question, call the completion callback
    // NOTE: Updating lesson progress via API should happen in the parent component
    // that receives this onAssessmentComplete callback.
    if (currentQuestionIndex === questions.length - 1) {
       // Pass final score and potentially a flag indicating if minimum score was met
       const totalPossibleScore = questions.reduce((acc, q) => acc + (q.points || 1), 0);
       // Example: Pass true if score is >= 50%
       const passed = updatedScore / totalPossibleScore >= 0.5;
       onAssessmentComplete(passed, updatedScore)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setIsSubmitted(false)
      setIsCorrect(null)
      setShowFeedback(null) // Reset feedback
    }
  }

  if (!currentQuestion) {
    // Example translation key: lesson.assessment.noQuestions
    return <p>{t('lesson.assessment.noQuestions')}</p> // Use full key path
  }

  // Calculate total possible score for display
  const totalPossibleScore = questions.reduce((acc, q) => acc + (q.points || 1), 0);

  return (
    <Card className="mt-6 border-primary/30">
      <CardHeader>
        {/* Example translation key: lesson.assessment.titlePrefix */}
        <CardTitle>{t('lesson.assessment.titlePrefix')} {currentQuestionIndex + 1}</CardTitle>
        {/* Render questionText using RichText component */}
        {/* <RichText content={currentQuestion.questionText} /> */}
        {/* Fallback to simple text if RichText is not ready */}
        <div className="prose dark:prose-invert max-w-none">
            {currentQuestion.questionText?.root?.children[0]?.children[0]?.text || 'Question content missing'}
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedAnswer ?? undefined}
          onValueChange={handleAnswerSelect}
          disabled={isSubmitted}
        >
          {currentQuestion.options?.map((option) => (
            <div key={option.id} className={`flex items-center space-x-2 p-3 rounded border ${
              isSubmitted && option.isCorrect ? 'border-green-500 bg-green-50' : ''
            } ${
              isSubmitted && !option.isCorrect && selectedAnswer === option.id ? 'border-red-500 bg-red-50' : ''
            }`}>
              <RadioGroupItem value={option.id!} id={option.id!} />
              <Label htmlFor={option.id!} className="flex-1 cursor-pointer">{option.text}</Label>
              {isSubmitted && option.isCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
              {isSubmitted && !option.isCorrect && selectedAnswer === option.id && <XCircle className="h-5 w-5 text-red-500" />}
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        {!isSubmitted ? (
          // Example translation key: lesson.assessment.submitButton
          <Button onClick={handleSubmit} disabled={!selectedAnswer}>
            {t('lesson.assessment.submitButton')}
          </Button>
        ) : (
          <>
            {isCorrect !== null && (
              <div className={`p-3 rounded text-sm mb-3 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {/* Example keys: lesson.assessment.correctFeedback, lesson.assessment.incorrectFeedback */}
                <strong>{isCorrect ? t('lesson.assessment.correctFeedback') : t('lesson.assessment.incorrectFeedback')}</strong>
                {/* Show specific feedback if available */}
                {showFeedback && (
                    // Assuming feedback is simple text for now
                    // If feedback is RichText, use the RichText component here
                    <p className="mt-1 text-xs">{showFeedback}</p>
                    // <RichText content={showFeedback} />
                )}
              </div>
            )}
            {currentQuestionIndex < questions.length - 1 ? (
              // Example translation key: lesson.assessment.nextButton
              <Button onClick={handleNextQuestion}>
                {t('lesson.assessment.nextButton')}
              </Button>
            ) : (
               // Example keys: lesson.assessment.quizComplete, lesson.assessment.scoreLabel
               <p className="text-sm font-medium">{t('lesson.assessment.quizComplete')} {t('lesson.assessment.scoreLabel')}: {score}/{totalPossibleScore}</p>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}