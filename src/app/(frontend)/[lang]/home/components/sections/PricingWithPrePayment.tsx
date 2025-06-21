'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { GridContainer } from '@/components/GridContainer'
import { CheckCircle, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAIAgencyPlans } from '../../hooks/useAIAgencyPlans'
import {
  formatFullPrice,
  formatPrepayment,
  getCurrencyColorClass,
} from '../../utils/planPriceFormatting'
import { useLeadFormModal } from '../LeadFormModalProvider'
import { useMobileAnimations, getSmoothAnimationProps, getOptimizedHoverProps } from '@/hooks/useMobileAnimations'
import { cn } from '@/lib/utils'

export function PricingWithPrePayment() {
  const locale = useLocale() as 'en' | 'ru'
  const t = useTranslations('aiAgency.pricing')
  const { plans, loading, error } = useAIAgencyPlans({ limit: 10 }) // Загружаем все планы
  const { openModal } = useLeadFormModal()
  const animationConfig = useMobileAnimations()

  // Scroll management
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Update scroll indicators
  const updateScrollIndicators = () => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  // Smooth scroll to specific card
  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const cardWidth = container.children[0]?.clientWidth || 0
    const gap = 16 // gap-4 = 16px
    const scrollPosition = index * (cardWidth + gap)

    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    })

    setCurrentIndex(index)
  }

  // Navigation functions
  const scrollLeft = () => {
    const newIndex = Math.max(0, currentIndex - 1)
    scrollToCard(newIndex)
  }

  const scrollRight = () => {
    const newIndex = Math.min(plans.length - 1, currentIndex + 1)
    scrollToCard(newIndex)
  }

  // Handle scroll events
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      updateScrollIndicators()

      // Update current index based on scroll position
      const cardWidth = container.children[0]?.clientWidth || 0
      const gap = 16
      const newIndex = Math.round(container.scrollLeft / (cardWidth + gap))
      setCurrentIndex(newIndex)
    }

    container.addEventListener('scroll', handleScroll)
    updateScrollIndicators()

    return () => container.removeEventListener('scroll', handleScroll)
  }, [plans.length])

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <GridContainer>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{t('title')}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl border-2 border-border p-8 animate-pulse"
              >
                <div className="text-center mb-8">
                  <div className="h-6 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <div className="h-4 bg-muted rounded mb-1"></div>
                    <div className="h-6 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="h-4 bg-muted rounded"></div>
                  ))}
                </div>
                <div className="h-12 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </GridContainer>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <GridContainer>
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </GridContainer>
      </section>
    )
  }
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <GridContainer settings={{ fullWidth: true, padding: { left: 'large', right: 'large' } }}>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{t('title')}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Enhanced horizontal scroll for plans */}
        <div className="relative mb-16">
          {/* Navigation buttons for desktop */}
          {!animationConfig.isMobile && plans.length > 3 && (
            <>
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center transition-all duration-200',
                  canScrollLeft ? 'opacity-100 hover:bg-background hover:shadow-lg' : 'opacity-50 cursor-not-allowed'
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={cn(
                  'absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center transition-all duration-200',
                  canScrollRight ? 'opacity-100 hover:bg-background hover:shadow-lg' : 'opacity-50 cursor-not-allowed'
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Scroll container with enhanced mobile support */}
          <div
            ref={scrollContainerRef}
            className={cn(
              'flex gap-4 md:gap-6 overflow-x-auto pb-4 px-2 md:px-4 scrollbar-hide',
              'scroll-smooth touch-smooth',
              animationConfig.isMobile ? 'snap-x snap-mandatory' : '',
              'justify-start md:justify-center'
            )}
            style={{
              scrollSnapType: animationConfig.isMobile ? 'x mandatory' : 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Enhanced pricing cards with smooth animations */}
            {plans.map((plan, index) => {
              const formattedPrice = formatFullPrice(plan, locale, t)
              const formattedPrepayment = formatPrepayment(plan, locale)
              const currencyColorClass = getCurrencyColorClass(plan.currency)
              const smoothAnimationProps = getSmoothAnimationProps(animationConfig, index * 0.1)
              const hoverProps = getOptimizedHoverProps(animationConfig)

              return (
                <motion.div
                  key={plan.id}
                  {...smoothAnimationProps}
                  {...hoverProps}
                  className={cn(
                    'relative bg-card rounded-2xl border-2 p-8 flex flex-col pricing-card',
                    'transition-all duration-300 ease-out',
                    animationConfig.isMobile ? 'snap-center min-w-[280px] max-w-[320px]' : 'min-w-[300px]',
                    plan.isPopular
                      ? 'border-purple-500 shadow-lg md:scale-105'
                      : 'border-border hover:border-border/60',
                    !animationConfig.isMobile && 'hover:shadow-xl hover:-translate-y-1'
                  )}
                  style={{
                    transform: animationConfig.isMobile ? 'none' : undefined,
                  }}
                >
                  {/* Бейдж популярного плана */}
                  {plan.isPopular && (
                    <div className="flex justify-center mb-4">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                        {t('popularChoice')}
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-foreground mb-4">{plan.name}</h3>
                    <div className="text-4xl font-bold text-foreground mb-2">{formattedPrice}</div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 mb-6">
                      <div className="text-sm text-muted-foreground mb-1">
                        {t('prepaymentLabel')}
                      </div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formattedPrepayment}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <motion.button
                      {...(animationConfig.enableHoverAnimations ? {
                        whileHover: { scale: 1.02 },
                        whileTap: { scale: 0.98 }
                      } : {})}
                      onClick={() =>
                        openModal({
                          type: 'pricing-plan',
                          title: `${t('selectPlan')} "${plan.name}"`,
                          description: `${t('cost')}: ${formattedPrice}. ${t('prepaymentLabel')}: ${formattedPrepayment}`,
                        })
                      }
                      className={cn(
                        'w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ease-out',
                        'touch-smooth active:scale-95',
                        plan.isPopular
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                          : 'bg-foreground text-background hover:bg-foreground/90'
                      )}
                    >
                      {t('selectPlan')}
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Enhanced scroll indicators */}
          {plans.length > 2 && (
            <div className="flex flex-col items-center mt-6 gap-3">
              {/* Dot indicators for mobile */}
              {animationConfig.isMobile && (
                <div className="flex gap-2">
                  {plans.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToCard(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all duration-200',
                        index === currentIndex
                          ? 'bg-purple-500 w-6'
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Scroll hint */}
              <div className="text-sm text-muted-foreground flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
                {animationConfig.isMobile ? (
                  <>
                    <span className="animate-pulse">←</span>
                    <span className="font-medium">
                      {t('swipeToSeeMore') || 'Свайпните, чтобы увидеть больше планов'}
                    </span>
                    <span className="animate-pulse">→</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">
                      {currentIndex + 1} из {plans.length} планов
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-3xl font-bold mb-4">{t('guaranteeSection.title')}</h3>
          <p className="text-xl text-blue-100 mb-6">
            {t('guaranteeSection.description')
              .split('\n')
              .map((line, index) => (
                <span key={index}>
                  {line}
                  {index === 0 && <br />}
                </span>
              ))}
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg"
            onClick={() => openModal({ type: 'guarantee', title: t('guaranteeSection.button') })}
          >
            {t('guaranteeSection.button')}
          </motion.button>
        </motion.div>
      </GridContainer>
    </section>
  )
}
