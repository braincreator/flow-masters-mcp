'use client'

import React, { Suspense, lazy } from 'react'
import '../styles.css'
import '../optimized-styles.css'
import { AIHeroSection } from './sections/AIHeroSection'
import { PainPointsSection } from './sections/PainPointsSection'
import { AIBenefitsSection } from './sections/AIBenefitsSection'
import { AIServicesShowcase } from './sections/AIServicesShowcase'
import { LazySection } from './LazySection'

// Lazy load heavy components
const AIStatsSection = lazy(() =>
  import('./sections/AIStatsSection').then((m) => ({ default: m.AIStatsSection })),
)
const CaseStudiesSection = lazy(() =>
  import('./sections/CaseStudiesSection').then((m) => ({ default: m.CaseStudiesSection })),
)
const AIQuizCalculator = lazy(() =>
  import('./sections/AIQuizCalculator').then((m) => ({ default: m.AIQuizCalculator })),
)
const PricingWithPrePayment = lazy(() =>
  import('./sections/PricingWithPrePayment').then((m) => ({ default: m.PricingWithPrePayment })),
)
const UrgencySection = lazy(() =>
  import('./sections/UrgencySection').then((m) => ({ default: m.UrgencySection })),
)
const AIFAQSection = lazy(() =>
  import('./sections/AIFAQSection').then((m) => ({ default: m.AIFAQSection })),
)
const FinalCTASection = lazy(() =>
  import('./sections/FinalCTASection').then((m) => ({ default: m.FinalCTASection })),
)

// Новые компоненты для улучшения конверсии
import { AnalyticsTracker } from './AnalyticsTracker'
const FeedbackWidget = lazy(() =>
  import('./FeedbackWidget').then((m) => ({ default: m.FeedbackWidget })),
)

import { LeadFormModalProvider } from './LeadFormModalProvider'
import { PerformanceProvider } from '@/components/PerformanceManager'
import { useMobileAnimations } from '@/hooks/useMobileAnimations'

// Loading fallback component
const SectionSkeleton = () => (
  <div className="py-20 animate-pulse">
    <div className="container mx-auto px-4">
      <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
      <div className="h-4 bg-muted rounded w-2/3 mx-auto mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded"></div>
        ))}
      </div>
    </div>
  </div>
)

export function AIAgencyLanding() {
  const animationConfig = useMobileAnimations()

  return (
    <PerformanceProvider>
      <LeadFormModalProvider>
        <AnalyticsTracker>
          <div className={`min-h-screen bg-background relative optimized-container smooth-scroll ${
            animationConfig.isMobile ? 'mobile-optimized-container' : ''
          }`}>
            {/* Hero Section - Always loaded */}
            <section data-section="hero">
              <AIHeroSection />
            </section>

            {/* Pain Points - Always loaded */}
            <section data-section="pain-points">
              <PainPointsSection />
            </section>

            {/* AI Benefits - Always loaded */}
            <section data-section="benefits">
              <AIBenefitsSection />
            </section>

            {/* Services Showcase - Always loaded */}
            <section data-section="services">
              <AIServicesShowcase />
            </section>

            {/* Stats Section - Lazy loaded */}
            <LazySection sectionId="stats">
              <Suspense fallback={<SectionSkeleton />}>
                <AIStatsSection />
              </Suspense>
            </LazySection>

            {/* Case Studies - Lazy loaded */}
            <LazySection sectionId="cases">
              <Suspense fallback={<SectionSkeleton />}>
                <CaseStudiesSection />
              </Suspense>
            </LazySection>

            {/* Quiz Calculator - Lazy loaded */}
            <LazySection sectionId="calculator">
              <Suspense fallback={<SectionSkeleton />}>
                <AIQuizCalculator />
              </Suspense>
            </LazySection>

            {/* Pricing - Lazy loaded */}
            <LazySection sectionId="pricing">
              <Suspense fallback={<SectionSkeleton />}>
                <PricingWithPrePayment />
              </Suspense>
            </LazySection>

            {/* Urgency Section - Lazy loaded */}
            <LazySection sectionId="urgency">
              <Suspense fallback={<SectionSkeleton />}>
                <UrgencySection />
              </Suspense>
            </LazySection>

            {/* FAQ - Lazy loaded */}
            <LazySection sectionId="faq">
              <Suspense fallback={<SectionSkeleton />}>
                <AIFAQSection />
              </Suspense>
            </LazySection>

            {/* Final CTA - Lazy loaded */}
            <LazySection sectionId="final-cta">
              <Suspense fallback={<SectionSkeleton />}>
                <FinalCTASection />
              </Suspense>
            </LazySection>

            {/* Floating widgets - Lazy loaded */}
            <Suspense fallback={null}>
              <FeedbackWidget />
            </Suspense>
          </div>
        </AnalyticsTracker>
      </LeadFormModalProvider>
    </PerformanceProvider>
  )
}
