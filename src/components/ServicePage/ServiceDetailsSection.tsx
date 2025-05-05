import React from 'react';
import { useTranslations } from 'next-intl';

interface ServiceDetailsSectionProps {
  // Define props if needed
}

const ServiceDetailsSection: React.FC<ServiceDetailsSectionProps> = () => {
  const t = useTranslations('servicesPage.serviceDetails');
  // TODO: Populate with more detailed content and potentially icons
  // Use Tailwind CSS for styling

  return (
    <section className="py-12 md:py-20 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-primary-foreground">
          {t('title')}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Detail Item 1 */}
          <div className="p-6 bg-card rounded-lg shadow-md text-card-foreground">
            <h3 className="text-xl font-semibold mb-2">{t('item1.title')}</h3>
            <p>{t('item1.description')}</p>
          </div>
          {/* Detail Item 2 */}
          <div className="p-6 bg-card rounded-lg shadow-md text-card-foreground">
            <h3 className="text-xl font-semibold mb-2">{t('item2.title')}</h3>
            <p>{t('item2.description')}</p>
          </div>
          {/* Detail Item 3 */}
          <div className="p-6 bg-card rounded-lg shadow-md text-card-foreground">
            <h3 className="text-xl font-semibold mb-2">{t('item3.title')}</h3>
            <p>{t('item3.description')}</p>
          </div>
          {/* Detail Item 4 */}
          <div className="p-6 bg-card rounded-lg shadow-md text-card-foreground">
            <h3 className="text-xl font-semibold mb-2">{t('item4.title')}</h3>
            <p>{t('item4.description')}</p>
          </div>
          {/* Detail Item 5 */}
          <div className="p-6 bg-card rounded-lg shadow-md text-card-foreground">
            <h3 className="text-xl font-semibold mb-2">{t('item5.title')}</h3>
            <p>{t('item5.description')}</p>
          </div>
          {/* Add more detail items if necessary */}
        </div>
      </div>
    </section>
  );
};

export default ServiceDetailsSection;