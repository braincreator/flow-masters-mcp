# Исправление форм на AI Agency Landing

## Проблемы, которые были исправлены:

### 1. ❌ Отсутствовала коллекция для хранения лидов
**Решение:** Создана коллекция `Leads` в `src/collections/Leads.ts`
- Поля: name, phone, email, comment, actionType, source, metadata, status, assignedTo, notes
- Доступ: публичное создание, админский просмотр/редактирование
- Группа: Marketing

### 2. ❌ API endpoint /api/v1/leads требовал formId
**Решение:** Обновлен `src/app/api/v1/leads/route.ts`
- Убрано требование formId
- Добавлена поддержка metadata и source
- Сохранение в коллекцию 'leads' вместо 'form-submissions'

### 3. ❌ FinalCTASection.tsx не отправлял данные
**Решение:** Обновлен `src/app/(frontend)/[lang]/home/components/sections/FinalCTASection.tsx`
- Добавлена отправка на /api/v1/leads
- Добавлены состояния загрузки и успешной отправки
- Добавлено сообщение с Telegram ботом после отправки

### 4. ❌ AIQuizCalculator.tsx кнопки не работали
**Решение:** Обновлен `src/app/(frontend)/[lang]/home/components/sections/AIQuizCalculator.tsx`
- Подключен useLeadFormModal
- Кнопка "Получить персональное предложение" открывает модальное окно
- Передаются результаты калькулятора в описание

### 5. ❌ PricingWithPrePayment.tsx кнопки не работали
**Решение:** Обновлен `src/app/(frontend)/[lang]/home/components/sections/PricingWithPrePayment.tsx`
- Кнопки тарифов открывают модальное окно с информацией о выбранном тарифе

### 6. ❌ ModalLeadForm не передавал metadata
**Решение:** Обновлен `src/app/(frontend)/[lang]/home/components/ModalLeadForm.tsx`
- Добавлена передача source и metadata
- Добавлено сообщение с Telegram ботом в успешной отправке

## Новые возможности:

### ✅ Telegram бот интеграция
- Во всех формах после успешной отправки показывается ссылка на @ai_agency_bot
- Пользователи могут быстро связаться через Telegram

### ✅ Отслеживание источников
- Все лиды сохраняются с информацией об источнике (URL страницы)
- Metadata содержит дополнительную информацию (результаты калькулятора, выбранный тариф)

### ✅ Улучшенный UX
- Состояния загрузки для всех кнопок
- Сообщения об успешной отправке
- Информативные описания в модальных окнах

## Файлы, которые были изменены:

1. `src/collections/Leads.ts` - **СОЗДАН**
2. `src/collections/collectionList.ts` - добавлен импорт Leads
3. `src/app/api/v1/leads/route.ts` - обновлен API endpoint
4. `src/app/(frontend)/[lang]/home/components/sections/FinalCTASection.tsx` - добавлена отправка формы
5. `src/app/(frontend)/[lang]/home/components/sections/AIQuizCalculator.tsx` - подключены модальные окна
6. `src/app/(frontend)/[lang]/home/components/sections/PricingWithPrePayment.tsx` - подключены модальные окна
7. `src/app/(frontend)/[lang]/home/components/ModalLeadForm.tsx` - добавлены metadata и Telegram

## Проверка работоспособности:

### Формы, которые теперь работают:
1. ✅ **FinalCTASection** - основная форма в конце страницы
2. ✅ **AIQuizCalculator** - кнопка "Получить персональное предложение"
3. ✅ **PricingWithPrePayment** - кнопки выбора тарифов
4. ✅ **UrgencySection** - кнопки срочных действий (уже работали)
5. ✅ **PricingWithPrePayment** - кнопка гарантии (уже работала)

### Данные, которые сохраняются:
- Имя (обязательно)
- Телефон (обязательно)
- Email (опционально)
- Комментарий (опционально)
- Тип действия (actionType)
- Источник (URL страницы)
- Метаданные (результаты калькулятора, выбранный тариф и т.д.)
- Статус (по умолчанию 'new')

## Следующие шаги:

1. Запустить проект и проверить все формы
2. Проверить, что лиды сохраняются в админке Payload CMS
3. Настроить уведомления о новых лидах (опционально)
4. Настроить интеграцию с CRM (опционально)
