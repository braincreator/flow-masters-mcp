import React, { useState } from 'react';

// Интерфейс для элемента FAQ
export interface FaqItemData { // Exporting for potential use elsewhere
  question: string;
  answer: string;
}

// Props для компонента FaqSection
interface FaqSectionProps {
  title?: string; // Optional title for the section
  items: FaqItemData[]; // Array of FAQ items to display
}

// Пример данных FAQ (можно вынести) - Keeping default for example
const defaultFaqData: FaqItemData[] = [
    {
    question: 'Что такое Generative AI (GenAI) и как это поможет моему бизнесу?',
    answer: 'GenAI — это тип искусственного интеллекта, способный создавать новый контент (тексты, изображения, код). В маркетинге и e-commerce он помогает автоматизировать создание рекламных объявлений, описаний товаров, персонализировать общение с клиентами, улучшать поддержку и многое другое, что ведет к росту эффективности и продаж.',
  },
  {
    question: 'Насколько безопасны и этичны решения на базе GenAI?',
    answer: 'Мы уделяем большое внимание качеству генерируемого контента, проверке на соответствие бренду и этическим нормам. Мы используем проверенные модели и настраиваем процессы так, чтобы минимизировать риски некорректных или неэтичных результатов.',
  },
  {
    question: 'Сколько стоят ваши услуги?',
    answer: 'Стоимость зависит от конкретной задачи, объема работ и выбранной модели сотрудничества (проект, подписка). Мы готовим индивидуальное коммерческое предложение после бесплатной консультации и обсуждения ваших потребностей. Примерные диапазоны цен указаны в плане портфеля услуг.',
  },
  {
    question: 'Как быстро я увижу результаты?',
    answer: 'Сроки зависят от сложности проекта. Некоторые результаты, например, генерация контента, могут быть получены достаточно быстро (дни/недели). Внедрение сложных систем персонализации или чат-ботов требует больше времени (недели/месяцы). Мы всегда обсуждаем реалистичные сроки на этапе предложения.',
  },
  {
    question: 'Как обеспечивается конфиденциальность моих данных и соответствие ФЗ-152?',
    answer: 'Мы строго соблюдаем политику конфиденциальности и требования ФЗ-152 "О персональных данных". При необходимости подписываем NDA. Данные клиентов используются только для выполнения согласованных работ и не передаются третьим лицам без разрешения.',
  },
  {
    question: 'Что нужно от меня для начала работы?',
    answer: 'Для начала достаточно вашего желания улучшить маркетинг или e-commerce с помощью ИИ и готовности предоставить информацию о вашем бизнесе, целях и текущих процессах на первичной консультации.',
  },
];

// Компонент для одного элемента FAQ с аккордеоном
const FaqItem: React.FC<FaqItemData> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Using theme-aware classes
    <div className="faq-item border-b border-border py-4">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium text-foreground">{question}</h3>
        <span className={`transform transition-transform duration-200 text-muted-foreground ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          {/* Replace with a proper icon component if available */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </span>
      </button>
      {isOpen && (
        <div className="mt-3 text-secondary-foreground prose dark:prose-invert max-w-none">
          {/* Consider rendering answer as markdown or rich text if needed */}
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};


const FaqSection: React.FC<FaqSectionProps> = ({
  title = "Часто Задаваемые Вопросы", // Default title
  items = defaultFaqData, // Use default data if items prop is not provided
}) => {
  return (
    // Using theme-aware classes
    <section className="py-12 md:py-20 bg-background text-foreground">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
          {title}
        </h2>
        <div className="faq-list space-y-2">
          {items.map((item, index) => (
            <FaqItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;