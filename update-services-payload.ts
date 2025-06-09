/**
 * Обновление услуг через Payload Local API
 */

import { getPayload } from 'payload'
import config from './src/payload.config'

// Функция для создания richText контента
function createRichText(text: string) {
  return {
    root: {
      type: "root",
      children: [{
        type: "paragraph",
        version: 1,
        children: [{
          type: "text",
          version: 1,
          text: text
        }]
      }],
      direction: null,
      format: "",
      indent: 0,
      version: 1
    }
  };
}

// Улучшенные данные для обновления существующих услуг
const serviceUpdates = [
  {
    searchTitle: "Экспресс-консультация по ИИ",
    updates: {
      description: {
        ru: createRichText(`Получите профессиональную оценку потенциала внедрения искусственного интеллекта в ваш бизнес всего за 30 минут. 

Наш эксперт проведет экспресс-анализ ваших бизнес-процессов, выявит наиболее перспективные точки для автоматизации и предоставит четкие рекомендации по приоритетам внедрения ИИ.

В результате консультации вы получите:
• Анализ текущих процессов с точки зрения автоматизации
• Список приоритетных направлений для внедрения ИИ
• Предварительную оценку ROI от автоматизации
• Рекомендации по следующим шагам
• Ответы на все ваши вопросы об ИИ

Идеально подходит для первичного знакомства с возможностями ИИ и принятия решения о дальнейших инвестициях в автоматизацию.`),
        en: createRichText(`Get a professional assessment of AI implementation potential for your business in just 30 minutes.

Our expert will conduct an express analysis of your business processes, identify the most promising automation points, and provide clear recommendations on AI implementation priorities.

As a result of the consultation, you will receive:
• Analysis of current processes from an automation perspective
• List of priority areas for AI implementation
• Preliminary ROI assessment from automation
• Recommendations for next steps
• Answers to all your AI questions

Perfect for initial familiarization with AI capabilities and making decisions about further automation investments.`)
      },
      features: {
        ru: [
          {
            name: "Экспресс-анализ процессов",
            description: "Быстрая оценка текущих бизнес-процессов на предмет автоматизации",
            included: true
          },
          {
            name: "Приоритизация направлений",
            description: "Определение наиболее перспективных областей для внедрения ИИ",
            included: true
          },
          {
            name: "ROI-оценка",
            description: "Предварительный расчет возврата инвестиций от автоматизации",
            included: true
          },
          {
            name: "Дорожная карта",
            description: "Краткий план следующих шагов по внедрению ИИ",
            included: true
          },
          {
            name: "Q&A сессия",
            description: "Ответы на все ваши вопросы об искусственном интеллекте",
            included: true
          }
        ],
        en: [
          {
            name: "Express Process Analysis",
            description: "Quick assessment of current business processes for automation potential",
            included: true
          },
          {
            name: "Direction Prioritization",
            description: "Identification of the most promising areas for AI implementation",
            included: true
          },
          {
            name: "ROI Assessment",
            description: "Preliminary calculation of return on investment from automation",
            included: true
          },
          {
            name: "Roadmap",
            description: "Brief plan of next steps for AI implementation",
            included: true
          },
          {
            name: "Q&A Session",
            description: "Answers to all your questions about artificial intelligence",
            included: true
          }
        ]
      }
    }
  }
];

async function updateServices() {
  console.log('🚀 Запуск обновления услуг через Payload API...');
  
  try {
    // Инициализируем Payload
    const payload = await getPayload({ config });
    console.log('✅ Payload инициализирован');
    
    // Получаем все существующие услуги
    const existingServices = await payload.find({
      collection: 'services',
      limit: 1000
    });
    
    console.log(`📊 Найдено услуг: ${existingServices.totalDocs}`);
    
    // Обновляем услуги
    for (const serviceUpdate of serviceUpdates) {
      const service = existingServices.docs.find(s => 
        (typeof s.title === 'object' && s.title.ru === serviceUpdate.searchTitle) ||
        s.title === serviceUpdate.searchTitle
      );
      
      if (service) {
        try {
          await payload.update({
            collection: 'services',
            id: service.id,
            data: serviceUpdate.updates
          });
          
          console.log(`✅ Обновлена услуга: ${serviceUpdate.searchTitle}`);
        } catch (error) {
          console.error(`❌ Ошибка обновления услуги ${serviceUpdate.searchTitle}:`, error.message);
        }
      } else {
        console.log(`⚠️ Услуга не найдена: ${serviceUpdate.searchTitle}`);
      }
    }
    
    console.log('\n🎯 Обновление завершено!');
    console.log('🌐 Проверьте результат: http://localhost:3000/admin/collections/services');
    
  } catch (error) {
    console.error('❌ Ошибка обновления:', error);
  }
}

// Запускаем обновление
updateServices();
