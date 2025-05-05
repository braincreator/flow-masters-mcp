import React from 'react';
import { useTranslations } from 'next-intl';

// TODO: Consider adding a carousel/slider library if needed for 'До/После'
// import { Carousel } from 'react-responsive-carousel'; // Example
// import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Example

interface PortfolioSectionProps {
  // Define props, e.g., array of portfolio items (before/after, examples)
}

const PortfolioSection: React.FC<PortfolioSectionProps> = () => {
  const t = useTranslations('servicesPage.portfolio');
  // TODO: Populate with actual portfolio examples based on LANDING_PAGE_PLAN.md
  // Use Tailwind CSS for styling

  // Placeholder data - Keep as is for now, represents specific examples
  const examples = [
    { niche: 'Одежда', before: 'Простое платье.', after: 'Элегантное вечернее платье из струящегося шелка, подчеркивающее фигуру. Идеально для особого случая.' },
    { niche: 'Электроника', before: 'Новый телефон.', after: 'Смартфон последнего поколения с революционной камерой 108 Мп, сверхбыстрым процессором и дисплеем AMOLED 120 Гц.' },
    { niche: 'Косметика', before: 'Крем для лица.', after: 'Увлажняющий крем с гиалуроновой кислотой и витамином С борется с признаками старения, придавая коже сияние и упругость.' },
  ];

  return (
    <section className="py-12 md:py-20 bg-background text-foreground">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-primary">
          {t('title')}
        </h2>

        {/* Option 1: Simple Grid for Examples by Niche */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
          {examples.map((example, index) => (
            <div key={index} className="p-6 bg-card rounded-lg shadow-md text-card-foreground border border-border">
              <h3 className="text-xl font-semibold mb-3 text-accent-foreground">{example.niche}</h3> {/* Keep niche hardcoded for now */}
              <div className="mb-3">
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('beforeLabel')}</p>
                <p className="text-secondary-foreground italic">{example.before}</p> {/* Keep example hardcoded */}
              </div>
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">{t('afterLabel')}</p>
                <p className="text-secondary-foreground font-medium">{example.after}</p> {/* Keep example hardcoded */}
              </div>
            </div>
          ))}
        </div>

        {/* TODO: Option 2: Implement 'До/После' Slider/Carousel */}
        {/* <div className="mb-12">
          <h3 className="text-2xl font-semibold text-center mb-6">{t('comparisonTitle')}</h3>
          { Placeholder for Carousel }
          <div className="p-6 bg-muted rounded-lg text-center text-muted-foreground">
            [{t('sliderPlaceholder')}]
          </div>
        </div> */}

        {/* TODO: Option 3: Demo Generator Placeholder */}
        {/* <div className="text-center">
          <h3 className="text-2xl font-semibold mb-4">{t('demoTitle')}</h3>
          <p className="text-muted-foreground mb-4">{t('demoDescription')}</p>
          <div className="flex justify-center items-center gap-2">
            <input type="text" placeholder={t('demoInputPlaceholder')} className="input input-bordered w-full max-w-xs" />
            <button className="btn btn-primary">{t('demoButton')}</button>
          </div>
        </div> */}

      </div>
    </section>
  );
};

export default PortfolioSection;