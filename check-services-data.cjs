const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/flow-masters';

async function checkServices() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Подключение к MongoDB установлено');
    
    const db = client.db('flow-masters');
    const services = await db.collection('services').find({}).limit(10).toArray();
    
    console.log(`📊 Найдено услуг: ${services.length}`);
    
    services.forEach((service, index) => {
      const title = typeof service.title === 'object' ? (service.title.ru || service.title.en) : service.title;
      console.log(`\n🔍 Услуга ${index + 1}: ${title}`);
      console.log(`   - serviceType: ${service.serviceType}`);
      console.log(`   - Есть features: ${!!service.features && service.features.length > 0}`);
      console.log(`   - Количество features: ${service.features ? service.features.length : 0}`);
      
      // Проверяем description vs shortDescription
      const descRu = service.description?.ru?.root?.children?.[0]?.children?.[0]?.text || '';
      const shortDescRu = service.shortDescription?.ru || '';
      const isSimilar = descRu.length > 0 && shortDescRu.length > 0 && 
                       descRu.substring(0, Math.min(50, descRu.length)) === shortDescRu.substring(0, Math.min(50, shortDescRu.length));
      
      console.log(`   - Description похож на shortDescription: ${isSimilar}`);
      console.log(`   - Description длина: ${descRu.length} символов`);
      console.log(`   - ShortDescription длина: ${shortDescRu.length} символов`);
      
      if (descRu.length > 0) {
        console.log(`   - Description начало: "${descRu.substring(0, 100)}..."`);
      }
      if (shortDescRu.length > 0) {
        console.log(`   - ShortDescription: "${shortDescRu}"`);
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await client.close();
  }
}

checkServices();
