import React from 'react';

// Интерфейс для описания конкретной услуги внутри категории
interface Service {
  id: string;
  title: string;
  description: string;
  // Опциональные детали (можно сделать раскрывающимися)
  deliverables?: string[]; // Что получает клиент
  stages?: string[]; // Этапы
  results?: string[]; // Ожидаемый результат/Выгоды
}

// Интерфейс для пропсов компонента детализации категории
interface ServiceCategoryDetailProps {
  id: string; // Якорь для навигации
  title: string;
  categoryDescription: string;
  services: Service[];
  ctaText?: string;
  onCtaClick?: (categoryId: string) => void;
}

const ServiceCategoryDetail: React.FC<ServiceCategoryDetailProps> = ({
  id,
  title,
  categoryDescription,
  services,
  ctaText = "Обсудить задачи",
  onCtaClick,
}) => {
  return (
    <section id={id} className="service-category-detail py-16 px-4 border-t border-gray-200"> {/* Пример стилизации */}
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold mb-4 text-center md:text-left">
          {title}
        </h2>
        <p className="text-lg text-gray-600 mb-10 text-center md:text-left">
          {categoryDescription}
        </p>

        <div className="space-y-8">
          {services.map((service) => (
            <div key={service.id} className="service-item bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-700 mb-4">{service.description}</p>
              {/* TODO: Добавить опциональные раскрывающиеся детали (deliverables, stages, results) */}
              {/* Пример простого вывода деталей: */}
              {service.deliverables && (
                <div className="mt-3">
                  <h4 className="font-medium text-gray-800">Что вы получаете:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {service.deliverables.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
              )}
               {service.stages && (
                <div className="mt-3">
                  <h4 className="font-medium text-gray-800">Основные этапы:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {service.stages.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
              )}
               {service.results && (
                <div className="mt-3">
                  <h4 className="font-medium text-gray-800">Ожидаемый результат:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {service.results.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => onCtaClick ? onCtaClick(id) : undefined}
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            {ctaText} по направлению &quot;{title}&quot;
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServiceCategoryDetail;