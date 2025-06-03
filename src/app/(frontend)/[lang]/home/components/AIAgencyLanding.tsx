'use client'

import React from 'react'
import '../styles.css'
import { AIHeroSection } from './sections/AIHeroSection'
import { PainPointsSection } from './sections/PainPointsSection'
import { AIBenefitsSection } from './sections/AIBenefitsSection'
import { AIServicesShowcase } from './sections/AIServicesShowcase'
import { AIStatsSection } from './sections/AIStatsSection'
import { CaseStudiesSection } from './sections/CaseStudiesSection'
import { PricingWithPrePayment } from './sections/PricingWithPrePayment'
import { AIQuizCalculator } from './sections/AIQuizCalculator'
import { UrgencySection } from './sections/UrgencySection'
import { AIFAQSection } from './sections/AIFAQSection'
import { FinalCTASection } from './sections/FinalCTASection'

// Новые компоненты для улучшения конверсии
import { AnalyticsTracker } from './AnalyticsTracker'
import { FeedbackWidget } from './FeedbackWidget'
import { SocialProofNotifications } from './SocialProofNotifications'
import { LeadFormModalProvider } from './LeadFormModalProvider'

export function AIAgencyLanding() {
  return (
    <LeadFormModalProvider>
      <AnalyticsTracker>
        <div className="min-h-screen bg-background relative">
          {/* Hero Section */}
          <section data-section="hero">
            <AIHeroSection />
          </section>

          {/* Pain Points */}
          <section data-section="pain-points">
            <PainPointsSection />
          </section>

          {/* AI Benefits */}
          <section data-section="benefits">
            <AIBenefitsSection />
          </section>

          {/* Services Showcase */}
          <section data-section="services">
            <AIServicesShowcase />
          </section>

          {/* Stats Section */}
          <section data-section="stats">
            <AIStatsSection />
          </section>

          {/* Case Studies */}
          <section data-section="cases">
            <CaseStudiesSection />
          </section>

          {/* Quiz Calculator */}
          <section data-section="calculator">
            <AIQuizCalculator />
          </section>

          {/* Pricing */}
          <section data-section="pricing">
            <PricingWithPrePayment />
          </section>

          {/* Urgency Section */}
          <section data-section="urgency">
            <UrgencySection />
          </section>

          {/* FAQ */}
          <section data-section="faq">
            <AIFAQSection />
          </section>

          {/* Final CTA */}
          <section data-section="final-cta">
            <FinalCTASection />
          </section>

          {/* Floating widgets */}
          <SocialProofNotifications />
          <FeedbackWidget />
        </div>
      </AnalyticsTracker>
    </LeadFormModalProvider>
  )
}
