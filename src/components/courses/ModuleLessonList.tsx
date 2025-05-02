import React from 'react';
import { Module, Lesson } from '@/payload-types';
import { Locale } from '@/constants';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'; // Assuming Shadcn UI Accordion
import { Link } from '@/components/ui/link'; // Use base Link
import { getTranslations } from 'next-intl/server';


interface ModuleLessonListProps {
  modules: Module[] | string[]; // Modules can be IDs or populated objects
  locale: Locale;
  courseSlug: string;
  // Add enrollment status later to determine link behavior/icons
  // enrollmentStatus?: 'enrolled' | 'not_enrolled';
  // completedLessons?: string[]; // Array of completed lesson IDs
}

// Helper to check if a module is populated
const isModulePopulated = (module: Module | string): module is Module => {
  return typeof module === 'object' && module !== null && 'lessons' in module;
};

// Helper to check if a lesson is populated
const isLessonPopulated = (lesson: Lesson | string): lesson is Lesson => {
  return typeof lesson === 'object' && lesson !== null && 'slug' in lesson;
};


const ModuleLessonList: React.FC<ModuleLessonListProps> = async ({
  modules,
  locale,
  courseSlug,
  // enrollmentStatus = 'not_enrolled',
  // completedLessons = [],
}) => {
  const t = await getTranslations({ locale, namespace: 'ModuleLessonList' });

  if (!modules || modules.length === 0) {
    return <p>{t('noModulesFound')}</p>;
  }

  // Filter out any potential string IDs if depth wasn't sufficient
  const populatedModules = modules.filter(isModulePopulated);

  if (populatedModules.length === 0) {
    return <p>{t('noModulesFound')}</p>; // Or show a different message
  }

  // Sort modules by order if the 'order' field exists and is populated
  // const sortedModules = populatedModules.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const sortedModules = populatedModules; // Assuming order is handled by fetch or backend for now

  return (
    <Accordion type="single" collapsible className="w-full">
      {sortedModules.map((module, index) => (
        <AccordionItem value={`module-${module.id}`} key={module.id}>
          <AccordionTrigger className="text-left hover:no-underline">
            <span className="font-semibold">{t('module')} {index + 1}: {module.title}</span>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 pl-4">
              {/* Use type assertion assuming 'lessons' will exist after backend types update */}
              {(module.lessons as (Lesson | string)[]) && (module.lessons as (Lesson | string)[]).length > 0 ? (
                (module.lessons as (Lesson | string)[]).filter(isLessonPopulated).map((lesson: Lesson) => { // Explicitly type 'lesson'
                  // const isCompleted = completedLessons.includes(lesson.id);
                  // Conceptual link, adjust later based on enrollment
                  const lessonUrl = `/${locale}/courses/${courseSlug}/lessons/${lesson.slug}`;

                  return (
                    <li key={lesson.id} className="flex items-center justify-between">
                      <Link
                        href={lessonUrl} // Placeholder/Conceptual URL
                        className="text-sm hover:underline flex-grow"
                        // Add disabled state later based on prerequisites/enrollment
                      >
                        {lesson.title}
                      </Link>
                      {/* Placeholder for completion/lock icons */}
                    </li>
                  );
                })
              ) : (
                <li className="text-sm text-muted-foreground">{t('noLessonsFound')}</li>
              )}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ModuleLessonList;