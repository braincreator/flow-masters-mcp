/**
 * Анализ проблем в коллекции services на основе существующих миграционных данных
 */

// Импортируем данные из существующих миграционных скриптов
const fs = require('fs');
const path = require('path');

// Функция для анализа richText контента
function analyzeRichTextContent(richText) {
  if (!richText || !richText.root || !richText.root.children) {
    return { length: 0, text: '' };
  }
  
  let text = '';
  function extractText(children) {
    for (const child of children) {
      if (child.type === 'text' && child.text) {
        text += child.text;
      } else if (child.children) {
        extractText(child.children);
      }
    }
  }
  
  extractText(richText.root.children);
  return { length: text.length, text: text.substring(0, 200) + '...' };
}

// Функция для анализа услуги
function analyzeService(service, index) {
  const title = typeof service.title === 'object' ? (service.title.ru || service.title.en) : service.title;
  
  console.log(`\n🔍 Услуга ${index + 1}: ${title}`);
  console.log(`   - Тип: ${service.serviceType}`);
  
  // Анализ features
  const hasFeatures = service.features && Object.keys(service.features).length > 0;
  const featuresCount = hasFeatures ? 
    (service.features.ru ? service.features.ru.length : 0) + 
    (service.features.en ? service.features.en.length : 0) : 0;
  
  console.log(`   - Есть features: ${hasFeatures}`);
  console.log(`   - Количество features: ${featuresCount}`);
  
  // Анализ описаний
  const descRu = service.description?.ru ? analyzeRichTextContent(service.description.ru) : { length: 0, text: '' };
  const shortDescRu = service.shortDescription?.ru || '';
  
  console.log(`   - Description длина: ${descRu.length} символов`);
  console.log(`   - ShortDescription длина: ${shortDescRu.length} символов`);
  
  // Проверка на дублирование
  const isSimilar = descRu.length > 0 && shortDescRu.length > 0 && 
                   descRu.text.substring(0, 50).toLowerCase().includes(shortDescRu.substring(0, 50).toLowerCase());
  
  console.log(`   - Описания похожи: ${isSimilar}`);
  
  // Оценка качества
  const issues = [];
  if (!hasFeatures) issues.push('Отсутствуют features');
  if (featuresCount < 3) issues.push('Мало features (< 3)');
  if (descRu.length < 200) issues.push('Короткое описание (< 200 символов)');
  if (isSimilar) issues.push('Описания дублируются');
  
  if (issues.length > 0) {
    console.log(`   ❌ Проблемы: ${issues.join(', ')}`);
  } else {
    console.log(`   ✅ Качество хорошее`);
  }
  
  return {
    title,
    hasFeatures,
    featuresCount,
    descriptionLength: descRu.length,
    shortDescriptionLength: shortDescRu.length,
    hasSimilarDescriptions: isSimilar,
    issues: issues.length
  };
}

// Примеры данных из существующих миграций (упрощенная версия)
const sampleServices = [
  {
    title: { ru: "Экспресс-консультация по ИИ", en: "Express AI Consultation" },
    serviceType: "consultation",
    description: {
      ru: {
        root: {
          children: [{
            children: [{
              text: "За 30 минут определим наиболее перспективные направления для внедрения искусственного интеллекта в ваши бизнес-процессы."
            }]
          }]
        }
      }
    },
    shortDescription: {
      ru: "Быстрая 30-минутная оценка потенциала ИИ с выявлением приоритетных точек автоматизации"
    },
    features: {} // Пустые features - проблема!
  },
  {
    title: { ru: "Стандартная консультация по ИИ", en: "Standard AI Consultation" },
    serviceType: "consultation",
    description: {
      ru: {
        root: {
          children: [{
            children: [{
              text: "Углубленная 90-минутная консультация для детального планирования внедрения искусственного интеллекта в ваш бизнес."
            }]
          }]
        }
      }
    },
    shortDescription: {
      ru: "Углубленная 90-минутная консультация с детальным планом внедрения ИИ и техническим заданием"
    },
    features: {
      ru: [
        { name: "Комплексный аудит", description: "Анализ процессов", included: true }
      ]
    } // Мало features - проблема!
  }
];

console.log('📊 Анализ проблем в коллекции Services');
console.log('=====================================');

const results = sampleServices.map(analyzeService);

// Общая статистика
console.log('\n📈 Общая статистика:');
console.log(`   - Всего услуг проанализировано: ${results.length}`);
console.log(`   - Услуг без features: ${results.filter(r => !r.hasFeatures).length}`);
console.log(`   - Услуг с малым количеством features: ${results.filter(r => r.featuresCount < 3).length}`);
console.log(`   - Услуг с короткими описаниями: ${results.filter(r => r.descriptionLength < 200).length}`);
console.log(`   - Услуг с дублирующимися описаниями: ${results.filter(r => r.hasSimilarDescriptions).length}`);

console.log('\n🎯 Рекомендации:');
console.log('1. Добавить детальные features для каждой услуги (минимум 3-6 штук)');
console.log('2. Расширить описания до 300-500 символов с конкретными деталями');
console.log('3. Сделать description и shortDescription различными по содержанию');
console.log('4. Использовать структурированный подход с списками и абзацами');

console.log('\n📁 Созданные файлы для решения проблем:');
console.log('   - migrate-services-enhanced.cjs - готовый скрипт миграции');
console.log('   - enhanced-services-data.json - пример улучшенной структуры');
console.log('   - SERVICES_IMPROVEMENT_GUIDE.md - подробное руководство');

console.log('\n🚀 Следующие шаги:');
console.log('1. Запустите MongoDB: brew services start mongodb-community');
console.log('2. Выполните миграцию: node migrate-services-enhanced.cjs');
console.log('3. Проверьте результат в админ-панели: http://localhost:3000/admin/collections/services');
