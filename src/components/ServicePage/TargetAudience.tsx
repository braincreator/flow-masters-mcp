import React from 'react';

// Интерфейс для описания сегмента ЦА
interface AudienceSegment {
  title: string;
  description: string;
  icon?: React.ReactNode; // Иконка для роли или отрасли
}

// Данные о ЦА (можно вынести)
const audienceSegments: AudienceSegment[] = [
  {
    title: 'Маркетологи и Руководители отделов',
    description: 'Для тех, кто ищет новые инструменты для повышения эффективности кампаний, лидогенерации и создания контента.',
    // icon: <MarketingIcon />,
  },
  {
    title: 'E-commerce Специалисты и Менеджеры',
    description: 'Для оптимизации карточек товаров, персонализации предложений, улучшения поддержки и повышения конверсии.',
    // icon: <EcommIcon />,
  },
  {
    title: 'Владельцы СМБ и Стартапы',
    description: 'Для получения конкурентного преимущества за счет автоматизации маркетинга и улучшения клиентского опыта без больших затрат.',
    // icon: <SmbIcon />,
  },
   {
    title: 'Digital-Агентства',
    description: 'Для расширения спектра услуг и предложения клиентам передовых AI-решений в маркетинге.',
    // icon: <AgencyIcon />,
  },
];

const TargetAudience: React.FC = () => {
  return (
    <section className="target-audience py-16 px-4 bg-gray-100"> {/* Пример стилизации */}
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Кому подходят наши решения?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {audienceSegments.map((segment, index) => (
            <div key={index} className="audience-segment bg-white p-6 rounded-lg shadow flex items-start space-x-4">
              {segment.icon && <div className="icon-container text-blue-600 text-3xl mt-1">{segment.icon}</div>} {/* Иконка */}
              <div>
                <h3 className="text-xl font-semibold mb-1">{segment.title}</h3>
                <p className="text-gray-600">{segment.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;