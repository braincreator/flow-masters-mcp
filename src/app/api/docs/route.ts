import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Документация API - возвращает информацию о доступных версиях и эндпоинтах
 */
export async function GET() {
  // Путь к директории API
  const apiDir = path.resolve(process.cwd(), 'src/app/api');
  
  try {
    // Сканируем доступные версии API
    const versions = fs.readdirSync(apiDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.match(/^v\d+$/))
      .map(dirent => dirent.name);
    
    // Если версий нет, вернем только основную информацию
    if (versions.length === 0) {
      return NextResponse.json({
        apiName: 'Flow Masters API',
        versions: ['v1'],
        defaultVersion: 'v1',
        notice: 'API переходит на версионированную структуру. Пожалуйста, используйте /api/v1/ для всех запросов.',
        documentation: '/api/docs',
        generated: new Date().toISOString()
      });
    }
    
    // Сканируем эндпоинты для каждой версии
    const apiMap = {};
    
    for (const version of versions) {
      const versionDir = path.join(apiDir, version);
      const endpoints = fs.readdirSync(versionDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
          const endpoint = dirent.name;
          const endpointPath = path.join(versionDir, endpoint);
          
          // Проверяем наличие подкаталогов с маршрутами
          let subEndpoints = [];
          try {
            const subdirs = fs.readdirSync(endpointPath, { withFileTypes: true })
              .filter(sd => sd.isDirectory());
            
            if (subdirs.length > 0) {
              subEndpoints = subdirs.map(sd => `/api/${version}/${endpoint}/${sd.name}`);
            }
          } catch (e) {
            // Игнорируем ошибки при сканировании подкаталогов
          }
          
          return {
            path: `/api/${version}/${endpoint}`,
            name: endpoint,
            subEndpoints: subEndpoints.length > 0 ? subEndpoints : undefined
          };
        });
      
      apiMap[version] = endpoints;
    }
    
    // Формируем ответ
    const apiDocs = {
      apiName: 'Flow Masters API',
      versions,
      defaultVersion: 'v1',
      endpoints: apiMap,
      documentation: '/api/docs',
      notice: 'Используйте версионированные пути для всех API запросов.',
      generated: new Date().toISOString()
    };
    
    return NextResponse.json(apiDocs);
  } catch (error) {
    console.error('Ошибка при генерации документации API:', error);
    
    return NextResponse.json({
      error: 'Не удалось сгенерировать документацию API',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
    }, { status: 500 });
  }
} 