import React from 'react'
import { useTranslations } from 'next-intl'

// Import existing generic service page components
import HeroSection from '@/components/ServicePage/HeroSection' // Assuming adaptation needed
import Advantages from '@/components/ServicePage/Advantages' // Assuming adaptation needed
import WorkProcess from '@/components/ServicePage/WorkProcess' // Assuming adaptation needed
import CaseStudiesPreview from '@/components/ServicePage/CaseStudiesPreview' // Assuming adaptation needed for reviews/cases
import FaqSection from '@/components/ServicePage/FaqSection' // Reusable
import CallToActionSection from '@/components/ServicePage/CallToActionSection' // Reusable

// Import newly created specific components
import ProblemSolutionSection from '@/components/ServicePage/ProblemSolutionSection'
import ServiceDetailsSection from '@/components/ServicePage/ServiceDetailsSection'
import PortfolioSection from '@/components/ServicePage/PortfolioSection'
import PricingSection from '@/components/ServicePage/PricingSection'

import { AdvantageItem } from '@/components/ServicePage/Advantages' // Import type
import { ProcessStepItem } from '@/components/ServicePage/WorkProcess' // Import type
import { CaseStudyOrReviewItem } from '@/components/ServicePage/CaseStudiesPreview' // Import type
import { FaqItemData } from '@/components/ServicePage/FaqSection' // Import type

// Import Theme Toggle component
import ThemeToggle from '@/components/ui/ThemeToggle'

const ServiceProductDescriptions: React.FC = () => {
  const t = useTranslations('servicesPage')

  // --- Data for Sections (Placeholders - should come from CMS or config) ---

  const heroData = {
    title: t('hero.title'),
    subtitle: t('hero.subtitle'),
    ctaText: t('hero.ctaText'),
    // ctaLink: "#contact", // Replaced by onCtaClick
    // visual: { type: 'image', src: '/path/to/hero-image.jpg' } // Example visual
  }

  const advantagesData: AdvantageItem[] = [
    {
      title: t('advantages.item1.title'),
      description: t('advantages.item1.description'),
      icon: '🚀',
    },
    {
      title: t('advantages.item2.title'),
      description: t('advantages.item2.description'),
      icon: '📈',
    },
    {
      title: t('advantages.item3.title'),
      description: t('advantages.item3.description'),
      icon: '💰',
    },
    {
      title: t('advantages.item4.title'),
      description: t('advantages.item4.description'),
      icon: '🔍',
    },
    {
      title: t('advantages.item5.title'),
      description: t('advantages.item5.description'),
      icon: '✨',
    },
    // Add more specific benefits if needed
  ]

  const workProcessData: ProcessStepItem[] = [
    {
      step: 1,
      title: t('workProcess.step1.title'),
      description: t('workProcess.step1.description'),
      icon: '1',
    },
    {
      step: 2,
      title: t('workProcess.step2.title'),
      description: t('workProcess.step2.description'),
      icon: '2',
    },
    {
      step: 3,
      title: t('workProcess.step3.title'),
      description: t('workProcess.step3.description'),
      icon: '3',
    },
    {
      step: 4,
      title: t('workProcess.step4.title'),
      description: t('workProcess.step4.description'),
      icon: '4',
    },
  ]

  const caseStudiesData: CaseStudyOrReviewItem[] = [
    // Placeholder - use actual cases or reviews related to product descriptions
    {
      id: 'pd-case1',
      clientName: t('caseStudies.item1.clientName'),
      industry: t('caseStudies.item1.industry'),
      challenge: t('caseStudies.item1.challenge'),
      solution: t('caseStudies.item1.solution'),
      result: t('caseStudies.item1.result'),
    },
    {
      id: 'pd-review1',
      clientName: t('caseStudies.item2.clientName'),
      reviewerTitle: t('caseStudies.item2.reviewerTitle'),
      reviewText: t('caseStudies.item2.reviewText'),
    },
    // Add more relevant items
  ]

  const faqData: FaqItemData[] = [
    { question: t('faq.item1.question'), answer: t('faq.item1.answer') },
    { question: t('faq.item2.question'), answer: t('faq.item2.answer') },
    { question: t('faq.item3.question'), answer: t('faq.item3.answer') },
    { question: t('faq.item4.question'), answer: t('faq.item4.answer') },
    { question: t('faq.item5.question'), answer: t('faq.item5.answer') },
  ]

  const ctaData = {
    title: t('cta.title'),
    text: t('cta.text'), // Changed from subtitle to text
    buttonText: t('cta.buttonText'),
    // formFields: [...] // Define form structure if CallToActionSection supports it
  }

  // --- Event Handlers ---
  const handleHeroCtaClick = () => {
    // Logic for hero CTA click, e.g., scroll to service details
    console.log('Hero CTA clicked!')
    const serviceDetailsSection = document.getElementById('service-details-section')
    serviceDetailsSection?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFormSubmit = (formData: { name: string; contact: string; comment: string }) => {
    // Logic to handle form submission (e.g., send to API)
    console.log('Form submitted:', formData)
    // Here you would typically make an API call
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Add Theme Toggle button */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* 1. Hero Section */}
      <HeroSection
        title={heroData.title}
        subtitle={heroData.subtitle}
        ctaText={heroData.ctaText}
        onCtaClick={handleHeroCtaClick} // Use onClick handler
        // visual={heroData.visual} // Pass visual if implemented
      />

      {/* 2. Service Details - Перемещено выше */}
      <section id="service-details-section">
        <ServiceDetailsSection />
      </section>

      {/* 3. Problem / Solution */}
      <ProblemSolutionSection />

      {/* 4. Advantages / Benefits */}
      <Advantages
        title={t('advantages.sectionTitle')}
        items={advantagesData} // Pass items array
      />

      {/* 5. How It Works */}
      <WorkProcess
        title={t('workProcess.sectionTitle')}
        steps={workProcessData} // Pass steps array
      />

      {/* 6. Portfolio / Examples */}
      <PortfolioSection />

      {/* 7. Reviews / Case Studies */}
      <CaseStudiesPreview
        title={t('caseStudies.sectionTitle')}
        items={caseStudiesData} // Pass items array
        // showMoreLink="/portfolio/product-descriptions" // Optional link
      />

      {/* 8. Pricing (Optional) */}
      <PricingSection />

      {/* 9. Final CTA / Contact Form */}
      <section id="contact-section">
        {' '}
        {/* Added ID for scrolling */}
        <CallToActionSection
          title={ctaData.title}
          text={ctaData.text} // Use text prop
          buttonText={ctaData.buttonText}
          onSubmit={handleFormSubmit} // Pass submit handler
        />
      </section>

      {/* 10. FAQ */}
      <FaqSection
        title={t('faq.sectionTitle')} // Pass title directly or from a variable
        items={faqData} // Pass items array
      />
    </div>
  )
}

export default ServiceProductDescriptions
