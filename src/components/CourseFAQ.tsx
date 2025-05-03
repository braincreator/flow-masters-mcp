import React from 'react';
import { useTranslations } from 'next-intl';

interface FAQItem {
  question: string;
  answer: string;
}

// Placeholder data - this will eventually come from props or context
const faqData: FAQItem[] = [
  {
    question: 'Is this course suitable for beginners?',
    answer: 'Yes, this course starts with the fundamentals and progressively covers more advanced topics. No prior experience is required.',
  },
  {
    question: 'What do I get after completing the course?',
    answer: 'Upon successful completion, you will receive a certificate of completion and access to all course materials indefinitely.',
  },
  {
    question: 'How long do I have access to the course?',
    answer: 'You have lifetime access to the course materials, including any future updates.',
  },
];

const CourseFAQ: React.FC = () => {
  // Assuming 'CoursePage' namespace or create a specific 'FAQ' namespace if preferred
  const t = useTranslations('CoursePage');

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
          {t('course.faq.title')}
        </h2>
        {/* Placeholder FAQ data - should be dynamic */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqData.map((item, index) => (
            <div key={index} className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">{item.question}</h3>
              <p className="text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseFAQ;