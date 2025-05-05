import React from 'react';

// Интерфейс для описания мини-кейса или отзыва
// Making it more generic to potentially include reviews too
export interface CaseStudyOrReviewItem {
  id: string;
  clientLogo?: string; // URL логотипа клиента
  clientName?: string; // Или имя клиента, если нет лого
  industry?: string; // Отрасль (для кейсов)
  challenge?: string; // Задача (для кейсов)
  solution?: string; // Решение с GenAI (для кейсов)
  result?: string; // Результат (для кейсов)
  reviewText?: string; // Текст отзыва (для отзывов)
  reviewerTitle?: string; // Должность оставившего отзыв
  linkToFullCase?: string; // Ссылка на полный кейс
  linkToSource?: string; // Ссылка на источник отзыва
}

// Props для компонента CaseStudiesPreview
interface CaseStudiesPreviewProps {
  title?: string; // Optional title for the section
  items: CaseStudyOrReviewItem[]; // Array of cases/reviews to display
  showMoreLink?: string; // Optional link to a page with all cases/reviews
  showMoreText?: string; // Text for the "show more" button/link
}


// Пример данных (можно вынести или получать из CMS/API) - Keeping default for example
const defaultCases: CaseStudyOrReviewItem[] = [
    {
    id: 'case1',
    clientName: 'Интернет-магазин "Модные Штучки"',
    industry: 'Ритейл (Одежда)',
    challenge: 'Низкая конверсия карточек товаров из-за шаблонных описаний.',
    solution: 'Сгенерировали уникальные, SEO-оптимизированные описания для 5000+ товаров с помощью GenAI.',
    result: '+15% к конверсии в покупку, +25% органического трафика на карточки.',
    // linkToFullCase: '/cases/modnie-shtuchki',
  },
  {
    id: 'case2',
    clientName: 'Онлайн-школа "Знание Сила"',
    industry: 'Онлайн-образование',
    challenge: 'Высокая стоимость привлечения лидов через контекстную рекламу.',
    solution: 'Автоматизировали генерацию и A/B-тестирование рекламных объявлений для Яндекс.Директ.',
    result: 'Снижение CPL на 20%, увеличение CTR на 12%.',
    // linkToFullCase: '/cases/znanie-sila',
  },
   {
    id: 'case3',
    // clientLogo: '/logos/tech-service.png',
    clientName: 'Сервисный Центр "ТехноПомощь"',
    industry: 'Услуги',
    challenge: 'Долгая обработка типовых запросов в поддержке.',
    solution: 'Внедрили GenAI чат-бота для ответов на частые вопросы и первичной диагностики.',
    result: 'Сокращение времени ответа на 40%, разгрузка операторов на 30%.',
    // linkToFullCase: '/cases/techno-pomosh',
  },
];

const CaseStudiesPreview: React.FC<CaseStudiesPreviewProps> = ({
  title = "Примеры наших работ", // Default title
  items = defaultCases, // Use default data if items prop is not provided
  showMoreLink,
  showMoreText = "Смотреть все кейсы",
}) => {
  return (
    // Using more generic class names and relying on theme variables potentially
    <section className="py-12 md:py-20 bg-muted text-muted-foreground">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            // Combined structure for Case Study or Review
            <div key={item.id} className="bg-card p-6 rounded-lg shadow-lg border border-border text-card-foreground flex flex-col">
              <div className="client-info mb-4 text-center">
                {item.clientLogo ? (
                  <img src={item.clientLogo} alt={item.clientName} className="h-10 mx-auto mb-2 object-contain" />
                ) : (
                  <h4 className="font-semibold text-lg text-accent-foreground">{item.clientName}</h4>
                )}
                {item.industry && <span className="text-sm text-secondary-foreground">{item.industry}</span>}
                {item.reviewerTitle && <span className="text-sm text-secondary-foreground">{item.reviewerTitle}</span>}
              </div>
              {/* Case Study Specific Fields */}
              {item.challenge && <p className="mb-2 text-sm"><strong className="text-foreground">Задача:</strong> {item.challenge}</p>}
              {item.solution && <p className="mb-2 text-sm"><strong className="text-foreground">Решение:</strong> {item.solution}</p>}
              {item.result && <p className="mb-4 text-sm"><strong className="text-green-600 dark:text-green-400">Результат:</strong> {item.result}</p>}
              {/* Review Specific Fields */}
              {item.reviewText && <p className="mb-4 italic text-secondary-foreground">&quot;{item.reviewText}&quot;</p>}

              <div className="mt-auto pt-4 border-t border-border">
                 {item.linkToFullCase && (
                  <a
                    href={item.linkToFullCase}
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    Читать кейс →
                  </a>
                )}
                 {item.linkToSource && (
                  <a
                    href={item.linkToSource}
                    className="text-primary hover:underline font-medium text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Источник отзыва →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        {showMoreLink && (
           <div className="text-center mt-12">
             <a
               href={showMoreLink}
               className="inline-block px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow hover:bg-primary/90 transition duration-300"
             >
               {showMoreText}
             </a>
           </div>
         )}
      </div>
    </section>
  );
};

export default CaseStudiesPreview;