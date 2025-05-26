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

export function AIAgencyLanding() {
  return (
    <AnalyticsTracker>
      <div className="min-h-screen bg-background relative">
        {/* Hero Section - Первый экран */}
        <section data-section="hero">
          <AIHeroSection />
        </section>
        
        {/* Pain Points - Боли клиентов */}
        <section data-section="pain-points">
          <PainPointsSection />
        </section>
        
        {/* AI Benefits - Выгоды от ИИ */}
        <section data-section="benefits">
          <AIBenefitsSection />
        </section>
        
        {/* Services Showcase - Витрина услуг */}
        <section data-section="services">
          <AIServicesShowcase />
        </section>
        
        {/* Stats Section - Статистика */}
        <section data-section="stats">
          <AIStatsSection />
        </section>
        
        {/* Case Studies - Кейсы */}
        <section data-section="cases">
          <CaseStudiesSection />
        </section>
        
        {/* Quiz Calculator - Интерактивный калькулятор */}
        <section data-section="calculator">
          <AIQuizCalculator />
        </section>
        
        {/* Pricing - Тарифы с объяснением предоплаты */}
        <section data-section="pricing">
          <PricingWithPrePayment />
        </section>
        
        {/* Urgency Section - Срочность */}
        <section data-section="urgency">
          <UrgencySection />
        </section>
        
        {/* FAQ - Частые вопросы */}
        <section data-section="faq">
          <AIFAQSection />
        </section>
        
        {/* Final CTA - Финальный призыв */}
        <section data-section="final-cta">
          <FinalCTASection />
        </section>

        {/* Floating widgets */}
        <SocialProofNotifications />
        <FeedbackWidget />
      </div>
    </AnalyticsTracker>
  )
}
