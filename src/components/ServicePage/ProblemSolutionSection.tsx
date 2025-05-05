import React from 'react';
import { useTranslations } from 'next-intl';

interface ProblemSolutionSectionProps {
  // Define props if needed, e.g., specific problems/solutions for this service
}

const ProblemSolutionSection: React.FC<ProblemSolutionSectionProps> = () => {
  const t = useTranslations('servicesPage.problemSolution');
  // Use Tailwind CSS for styling

  return (
    <section className="py-12 md:py-20 bg-background text-foreground">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Problem Section */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-red-500 dark:text-red-400">
              {t('problemTitle')}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-lg text-secondary-foreground">
              <li>{t('problem1')}</li>
              <li>{t('problem2')}</li>
              <li>{t('problem3')}</li>
              {/* Add more problems if necessary */}
            </ul>
          </div>

          {/* Solution Section */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-green-600 dark:text-green-400">
              {t('solutionTitle')}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-lg text-secondary-foreground">
              <li>{t('solution1')}</li>
              <li>{t('solution2')}</li>
              <li>{t('solution3')}</li>
              {/* Add more solutions if necessary */}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;