import React from 'react';
import { useTranslations } from 'next-intl';

interface PricingTierProps {
  name: string;
  description: string;
  price?: string; // Optional, for fixed price tiers
  features: string[];
  isFeatured?: boolean;
  ctaText: string;
  ctaLink?: string; // Or an onClick handler
}

const PricingTier: React.FC<PricingTierProps> = ({ name, description, price, features, isFeatured, ctaText, ctaLink }) => {
  return (
    <div className={`p-6 rounded-lg shadow-md border ${isFeatured ? 'border-primary scale-105 bg-primary/5' : 'border-border bg-card'} text-card-foreground flex flex-col`}>
      <h3 className={`text-xl font-semibold mb-2 ${isFeatured ? 'text-primary' : ''}`}>{name}</h3>
      <p className="text-muted-foreground mb-4 flex-grow">{description}</p>
      {price && (
        <p className="text-3xl font-bold mb-4">{price}</p> // Keep price placeholder for now
      )}
      <ul className="space-y-2 mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            {/* Basic checkmark, replace with actual icon if available */}
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            {feature}
          </li>
        ))}
      </ul>
      <a
        href={ctaLink || '#'} // Placeholder link
        className={`mt-auto block text-center px-4 py-2 rounded font-semibold ${isFeatured ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'}`}
        // Add onClick handler if needed
      >
        {ctaText}
      </a>
    </div>
  );
};


interface PricingSectionProps {
  // Define props if needed, e.g., pricing data from an API
}

const PricingSection: React.FC<PricingSectionProps> = () => {
  const t = useTranslations('servicesPage.pricing');
  // TODO: Populate with actual pricing data based on LANDING_PAGE_PLAN.md or external source
  // Use Tailwind CSS for styling

  const tiers: PricingTierProps[] = [
    {
      name: t('tier1.name'),
      description: t('tier1.description'),
      price: '$X / mo', // Placeholder - Consider how to handle dynamic/localized pricing
      features: [
        t('tier1.feature1'),
        t('tier1.feature2'),
        t('tier1.feature3')
      ],
      ctaText: t('tier1.ctaText'),
      ctaLink: '#contact', // Link to contact form/section
    },
    {
      name: t('tier2.name'),
      description: t('tier2.description'),
      price: '$Y / mo', // Placeholder
      features: [
        t('tier2.feature1'),
        t('tier2.feature2'),
        t('tier2.feature3'),
        t('tier2.feature4')
      ],
      isFeatured: true,
      ctaText: t('tier2.ctaText'),
      ctaLink: '#contact',
    },
    {
      name: t('tier3.name'),
      description: t('tier3.description'),
      // No price shown, typically requires contact
      features: [
        t('tier3.feature1'),
        t('tier3.feature2'),
        t('tier3.feature3'),
        t('tier3.feature4')
      ],
      ctaText: t('tier3.ctaText'),
      ctaLink: '#contact',
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-primary-foreground">
          {t('title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {tiers.map((tier, index) => (
            <PricingTier key={index} {...tier} />
          ))}
        </div>
        <p className="text-center mt-8 text-muted-foreground">
          {t('footnote.text')} <a href="#contact" className="text-primary hover:underline">{t('footnote.link')}</a> {t('footnote.end')}
        </p>
      </div>
    </section>
  );
};

export default PricingSection;