import React from 'react';

// Интерфейс для описания преимущества
export interface AdvantageItem { // Exporting for potential use elsewhere
  title: string;
  description: string;
  icon?: React.ReactNode; // Иконка для преимущества
}

// Props для компонента Advantages
interface AdvantagesProps {
  title?: string; // Optional title for the section
  items: AdvantageItem[]; // Array of advantages to display
}

// Default advantages data (can be overridden by props)
const defaultAdvantages: AdvantageItem[] = [
    {
    title: 'Экспертиза в GenAI для РФ',
    description: 'Глубокое понимание специфики российского рынка маркетинга, e-commerce и локальных платформ.',
    // icon: <RussiaFocusIcon />,
  },
  {
    title: 'Фокус на Результат',
    description: 'Мы не просто внедряем ИИ, а помогаем достигать конкретных бизнес-целей: рост продаж, повышение конверсии, снижение затрат.',
    // icon: <ResultsIcon />,
  },
  {
    title: 'Опыт Интеграций',
    description: 'Успешно интегрируем GenAI-решения с популярными в России CRM, CMS, рекламными кабинетами (Bitrix24, 1С, Яндекс.Директ и др.).',
    // icon: <IntegrationIcon />,
  },
  {
    title: 'Кастомный Промпт-Инжиниринг',
    description: 'Создаем уникальные промпты для генерации контента, идеально соответствующего вашему бренду и задачам.',
    // icon: <PromptIcon />,
  },
   {
    title: 'Соблюдение Законодательства',
    description: 'Обеспечиваем соответствие наших решений требованиям ФЗ-152 "О персональных данных" и другим нормам РФ.',
    // icon: <LawIcon />,
  },
   {
    title: 'Прозрачный Процесс',
    description: 'Работаем по понятным этапам с регулярной отчетностью и вовлечением клиента.',
    // icon: <ProcessIcon />,
  },
];


const Advantages: React.FC<AdvantagesProps> = ({
  title = "Почему выбирают нас?", // Default title
  items = defaultAdvantages, // Use default data if items prop is not provided
}) => {
  return (
    // Using more generic class names and relying on theme variables potentially
    <section className="py-12 md:py-20 bg-background text-foreground">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div key={index} className="advantage-item text-center p-6 bg-card text-card-foreground rounded-lg shadow-md border border-border">
              {item.icon && <div className="icon-container text-primary text-4xl mb-4 inline-block">{item.icon}</div>} {/* Иконка */}
              <h3 className="text-xl font-semibold mb-2 text-accent-foreground">{item.title}</h3>
              <p className="text-secondary-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;