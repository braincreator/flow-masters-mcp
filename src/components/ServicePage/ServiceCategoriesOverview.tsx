import React from 'react';

// Интерфейс для описания категории услуг
interface ServiceCategory {
  id: string; // Для ключей и навигации (например, 'content-creation')
  title: string;
  description: string;
  icon?: React.ReactNode; // Можно использовать SVG иконки
  // link?: string; // Ссылка на детальный раздел (может быть якорем #id)
}

// Данные категорий (можно вынести в отдельный файл/константы)
const categories: ServiceCategory[] = [
  {
    id: 'content-creation',
    title: 'Создание Контента с Помощью ИИ',
    description: 'Генерация текстов, SEO-оптимизация, описания товаров и другой контент для маркетинга и e-commerce.',
    // icon: <ContentIcon />, // Пример
  },
  {
    id: 'personalization',
    title: 'Персонализация на Основе ИИ',
    description: 'Адаптация маркетинговых кампаний и пользовательского опыта на сайте под каждого клиента.',
    // icon: <PersonalizationIcon />,
  },
  {
    id: 'conversational-commerce',
    title: 'Разговорная Коммерция и Поддержка с ИИ',
    description: 'Внедрение умных чат-ботов для продаж, консультаций и поддержки клиентов 24/7.',
    // icon: <ChatbotIcon />,
  },
  {
    id: 'product-enhancement',
    title: 'Улучшение Продуктов и Мерчендайзинга с ИИ',
    description: 'Автоматическая генерация описаний, тегов, категорий и даже визуалов для ваших товаров.',
    // icon: <ProductIcon />,
  },
  {
    id: 'strategy-integration',
    title: 'Стратегия и Интеграция GenAI (РФ)',
    description: 'Консультации по внедрению ИИ и интеграция с вашими CRM, CMS и другими системами.',
    // icon: <StrategyIcon />,
  },
  {
    id: 'training',
    title: 'Обучение и Воркшопы',
    description: 'Повышение квалификации вашей команды в области применения GenAI для бизнеса.',
    // icon: <TrainingIcon />,
  },
];

interface ServiceCategoriesOverviewProps {
  onCategoryClick?: (categoryId: string) => void; // Функция для обработки клика (например, скролл к секции)
}

const ServiceCategoriesOverview: React.FC<ServiceCategoriesOverviewProps> = ({ onCategoryClick }) => {
  return (
    <section className="service-categories-overview py-16 px-4 bg-gray-50"> {/* Пример стилизации */}
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Направления Услуг
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
              onClick={() => onCategoryClick ? onCategoryClick(category.id) : window.location.hash = `#${category.id}`} // Пример навигации по якорю
            >
              {category.icon && <div className="icon-container mb-4 text-blue-600">{category.icon}</div>} {/* Место для иконки */}
              <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
              <p className="text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategoriesOverview;