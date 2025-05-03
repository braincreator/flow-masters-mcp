import React from 'react';
import { useTranslations } from 'next-intl';
import type { Course } from '@/payload-types'; // Import Course type
import RichText from '@/components/RichText'; // Import the RichText renderer
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'; // Import Accordion components

interface CourseFAQProps {
  title?: Course['faqTitle'];
  faqs?: Course['faqs'];
}

const CourseFAQ: React.FC<CourseFAQProps> = ({ title, faqs }) => {
  const t = useTranslations('CoursePage');

  // Don't render if no FAQs are provided
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
          {title || t('course.faq.title')}
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item) => (
              // Ensure item and item.id exist before rendering
              item && item.id && (
                <AccordionItem key={item.id} value={`item-${item.id}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    {/* Render answer using RichText */}
                    <div className="prose dark:prose-invert max-w-none">
                      <RichText data={item.answer} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default CourseFAQ;