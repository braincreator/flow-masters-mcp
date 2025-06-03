'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import {
  Calculator,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { TrackedCTA } from '../TrackedCTA'
import { useAnalytics } from '@/providers/AnalyticsProvider'
import { cn } from '@/lib/utils'
import { useLeadFormModal } from '../LeadFormModalProvider'
import { useTranslations, useLocale } from 'next-intl'
import { formatCurrencyLocalized } from '@/utilities/formatLocalized'

interface QuizAnswer {
  stepId: string
  selectedOption: string
  multiplier: number
}

export function AIQuizCalculator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string>('')
  const { trackEvent } = useAnalytics()
  const { openModal } = useLeadFormModal()
  const t = useTranslations('aiAgency.quiz')
  const locale = useLocale() as 'en' | 'ru'

  // Create quiz steps from translations
  const quizSteps = [
    {
      id: 'business-type',
      title: t('questions.0.question'),
      subtitle: t('subtitle'),
      options: [
        { id: 'ecommerce', label: t('questions.0.options.0'), multiplier: 1.2 },
        { id: 'services', label: t('questions.0.options.1'), multiplier: 1.0 },
        { id: 'manufacturing', label: t('questions.0.options.2'), multiplier: 0.8 },
        { id: 'b2b', label: t('questions.0.options.3'), multiplier: 1.1 },
      ],
    },
    {
      id: 'team-size',
      title: t('questions.1.question'),
      subtitle: t('subtitle'),
      options: [
        { id: 'small', label: t('questions.1.options.0'), multiplier: 0.8 },
        { id: 'medium', label: t('questions.1.options.1'), multiplier: 1.0 },
        { id: 'large', label: t('questions.1.options.2'), multiplier: 1.3 },
        { id: 'enterprise', label: t('questions.1.options.3'), multiplier: 1.5 },
      ],
    },
    {
      id: 'monthly-revenue',
      title: t('questions.2.question'),
      subtitle: t('subtitle'),
      options: [
        { id: 'startup', label: t('questions.2.options.0'), multiplier: 0.7 },
        { id: 'small-business', label: t('questions.2.options.1'), multiplier: 1.0 },
        { id: 'medium-business', label: t('questions.2.options.2'), multiplier: 1.4 },
        { id: 'large-business', label: t('questions.2.options.3'), multiplier: 2.0 },
      ],
    },
  ]

  const trackCalculatorCompletion = (results: any) => {
    trackEvent('engagement', 'calculator_completion', 'ai_benefits_calculator', undefined, {
      monthlyROI: results.monthlyROI,
      timeSavings: results.timeSavings,
      conversionIncrease: results.conversionIncrease,
      yearlyROI: results.yearlyROI,
      investmentRange: results.investmentRange,
    })
  }

  const currentQuizStep = quizSteps[currentStep]
  const isLastStep = currentStep === quizSteps.length - 1

  const handleNext = () => {
    if (!selectedOption) return

    const option = currentQuizStep.options.find((opt) => opt.id === selectedOption)
    if (!option) return

    const newAnswer: QuizAnswer = {
      stepId: currentQuizStep.id,
      selectedOption,
      multiplier: option.multiplier,
    }

    const newAnswers = [...answers]
    newAnswers[currentStep] = newAnswer
    setAnswers(newAnswers)

    if (isLastStep) {
      setShowResults(true)
      const results = calculateResults(newAnswers)
      trackCalculatorCompletion(results)
    } else {
      setCurrentStep(currentStep + 1)
      setSelectedOption('')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      const prevAnswer = answers[currentStep - 1]
      setSelectedOption(prevAnswer?.selectedOption || '')
    }
  }

  const calculateResults = (finalAnswers: QuizAnswer[]) => {
    let totalMultiplier = 1
    finalAnswers.forEach((answer) => {
      totalMultiplier *= answer.multiplier
    })

    const baseROI = 200000 // Base ROI in rubles
    const baseSavings = 80 // Base time savings in hours
    const baseConversion = 15 // Base conversion increase in %

    return {
      monthlyROI: Math.round(baseROI * totalMultiplier),
      timeSavings: Math.round(baseSavings * totalMultiplier),
      conversionIncrease: Math.round(baseConversion * totalMultiplier),
      yearlyROI: Math.round(baseROI * totalMultiplier * 12),
      investmentRange:
        totalMultiplier > 1.5 ? '200-400' : totalMultiplier > 1.2 ? '150-300' : '80-200',
    }
  }

  const results = showResults ? calculateResults(answers) : null

  const resetQuiz = () => {
    setCurrentStep(0)
    setAnswers([])
    setShowResults(false)
    setSelectedOption('')
    trackEvent('engagement', 'calculator_reset', 'ai_benefits_calculator')
  }

  if (showResults && results) {
    return (
      <section className="py-20 bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 dark:to-background">
        <GridContainer>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">{t('results.title')}</h2>
              <p className="text-xl text-muted-foreground">{t('results.description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-card rounded-2xl p-6 border border-border shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">
                  +{formatCurrencyLocalized(results.monthlyROI, locale)}
                </div>
                <div className="text-muted-foreground">{t('results.metrics.monthlyProfit')}</div>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">
                  {results.timeSavings}
                  {t('results.metrics.hoursUnit')}
                </div>
                <div className="text-muted-foreground">{t('results.metrics.timeSavings')}</div>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">
                  +{results.conversionIncrease}%
                </div>
                <div className="text-muted-foreground">{t('results.metrics.conversionGrowth')}</div>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">
                  {t('results.metrics.investmentRange', { range: results.investmentRange })}
                </div>
                <div className="text-muted-foreground">{t('results.metrics.investment')}</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">
                {t('results.metrics.yearlyROI', {
                  amount: formatCurrencyLocalized(results.yearlyROI, locale),
                })}
              </h3>
              <p className="text-blue-100 mb-6">{t('results.metrics.paybackPeriod')}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    openModal({
                      type: 'calculator-result',
                      title: t('results.getQuote'),
                      description: `${t('results.description')} ROI +${formatCurrencyLocalized(results.yearlyROI, locale)}`,
                    })
                  }
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('results.getQuote')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetQuiz}
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                >
                  {t('startButton')}
                </motion.button>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 text-center">
              <h4 className="font-bold text-foreground mb-2">{t('results.specialOffer.title')}</h4>
              <p className="text-foreground/80">{t('results.specialOffer.description')}</p>
            </div>
          </motion.div>
        </GridContainer>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-blue-50 dark:to-blue-950/20">
      <GridContainer>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{t('title')}</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">{t('subtitle')}</p>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">
                {t('results.progress.step', { current: currentStep + 1, total: quizSteps.length })}
              </span>
              <span className="text-sm text-muted-foreground">
                {t('results.progress.percentage', {
                  percent: Math.round(((currentStep + 1) / quizSteps.length) * 100),
                })}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / quizSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Quiz Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-2xl p-8 shadow-lg border border-border"
            >
              <h3 className="text-2xl font-bold text-foreground mb-4">{currentQuizStep.title}</h3>
              <p className="text-muted-foreground mb-8">{currentQuizStep.subtitle}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentQuizStep.options.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedOption(option.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all duration-300',
                      selectedOption === option.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100'
                        : 'border-border bg-card text-foreground hover:border-border/60 hover:bg-muted/50',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {selectedOption === option.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300',
                    currentStep === 0
                      ? 'text-muted-foreground/50 cursor-not-allowed'
                      : 'text-foreground hover:bg-muted/50',
                  )}
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('prevButton')}
                </button>

                <button
                  onClick={handleNext}
                  disabled={!selectedOption}
                  className={cn(
                    'flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300',
                    !selectedOption
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl',
                  )}
                >
                  {isLastStep ? t('submitButton') : t('nextButton')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </GridContainer>
    </section>
  )
}
