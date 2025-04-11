import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const QuizAssessment: Block = {
  slug: 'quizAssessment',
  interfaceName: 'QuizAssessmentBlock',
  labels: {
    singular: 'Квиз/Тест',
    plural: 'Квизы/Тесты',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название квиза/теста',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание/Инструкция',
      editor: lexicalEditor({}),
    },
    {
      name: 'relatedCourseOrModule',
      type: 'relationship',
      relationTo: ['courses', 'modules'], // Связь с курсами или модулями (если есть)
      label: 'Связать с курсом/модулем (опционально)',
      admin: {
        description: 'Для группировки тестов или связи с прогрессом.',
      },
    },
    {
      name: 'questions',
      type: 'array',
      label: 'Вопросы',
      minRows: 1,
      fields: [
        {
          name: 'questionText',
          type: 'richText',
          label: 'Текст вопроса',
          editor: lexicalEditor({}),
          required: true,
        },
        {
          name: 'questionType',
          type: 'select',
          label: 'Тип вопроса',
          required: true,
          defaultValue: 'singleChoice',
          options: [
            { label: 'Один вариант ответа', value: 'singleChoice' },
            { label: 'Несколько вариантов ответа', value: 'multipleChoice' },
            { label: 'Открытый ответ (текст)', value: 'openText' },
            { label: 'Сопоставление', value: 'matching' },
            { label: 'Порядок', value: 'ordering' },
            // { label: 'Заполнение пропусков', value: 'fillInTheBlanks' }, // Более сложный
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Изображение к вопросу (опционально)',
        },
        {
          name: 'options',
          type: 'array',
          label: 'Варианты ответа',
          minRows: 2,
          admin: {
            condition: (data, siblingData) =>
              siblingData.questionType === 'singleChoice' ||
              siblingData.questionType === 'multipleChoice',
          },
          fields: [
            {
              name: 'optionText',
              type: 'text',
              label: 'Текст варианта',
              required: true,
            },
            {
              name: 'isCorrect',
              type: 'checkbox',
              label: 'Правильный ответ',
              defaultValue: false,
            },
            {
              name: 'feedback',
              type: 'text',
              label: 'Пояснение (почему правильно/неправильно, опционально)',
            },
          ],
        },
        {
          name: 'matchingPairs',
          type: 'array',
          label: 'Пары для сопоставления',
          minRows: 2,
          admin: {
            condition: (data, siblingData) => siblingData.questionType === 'matching',
          },
          fields: [
            {
              name: 'prompt',
              type: 'text',
              label: 'Сопоставляемый элемент A',
              required: true,
            },
            {
              name: 'correctMatch',
              type: 'text',
              label: 'Правильный элемент B',
              required: true,
            },
          ],
        },
        {
          name: 'orderingItems',
          type: 'array',
          label: 'Элементы для упорядочивания',
          minRows: 2,
          admin: {
            condition: (data, siblingData) => siblingData.questionType === 'ordering',
          },
          fields: [
            {
              name: 'itemText',
              type: 'text',
              label: 'Текст элемента',
              required: true,
            },
            // Правильный порядок будет определяться порядком в этом массиве
          ],
        },
        {
          name: 'correctAnswerText',
          type: 'textarea',
          label: 'Правильный ответ (для открытого типа)',
          admin: {
            condition: (data, siblingData) => siblingData.questionType === 'openText',
            description: 'Пример правильного ответа, для сравнения или ручной проверки',
          },
        },
        {
          name: 'points',
          type: 'number',
          label: 'Баллы за правильный ответ',
          defaultValue: 1,
          min: 0,
        },
        {
          name: 'feedbackForAll',
          type: 'richText',
          label: 'Общее пояснение к вопросу (после ответа)',
          editor: lexicalEditor({}),
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Настройки теста',
      fields: [
        {
          name: 'timeLimit',
          type: 'number',
          label: 'Ограничение по времени (минуты, 0 - нет)',
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'passingScore',
          type: 'number',
          label: 'Проходной балл (%)',
          min: 0,
          max: 100,
          defaultValue: 70,
        },
        {
          name: 'attemptsAllowed',
          type: 'number',
          label: 'Количество попыток (0 - неограниченно)',
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'randomizeQuestions',
          type: 'checkbox',
          label: 'Перемешивать вопросы',
          defaultValue: false,
        },
        {
          name: 'randomizeOptions',
          type: 'checkbox',
          label: 'Перемешивать варианты ответов',
          defaultValue: false,
        },
        {
          name: 'showCorrectAnswers',
          type: 'select',
          label: 'Когда показывать правильные ответы',
          defaultValue: 'afterAttempt',
          options: [
            { label: 'После каждой попытки', value: 'afterAttempt' },
            { label: 'Только после последней попытки', value: 'afterLastAttempt' },
            { label: 'После прохождения (если успешно)', value: 'afterPassing' },
            { label: 'Никогда', value: 'never' },
          ],
        },
        {
          name: 'showFeedback',
          type: 'checkbox',
          label: 'Показывать пояснения к ответам',
          defaultValue: true,
        },
        {
          name: 'trackProgress',
          type: 'checkbox',
          label: 'Сохранять результаты в профиле пользователя',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'resultMessages',
      type: 'group',
      label: 'Сообщения по результатам',
      fields: [
        {
          name: 'passMessage',
          type: 'richText',
          label: 'Сообщение при успешном прохождении',
          editor: lexicalEditor({}),
          defaultValue: [{ children: [{ text: 'Поздравляем, вы успешно прошли тест!' }] }],
        },
        {
          name: 'failMessage',
          type: 'richText',
          label: 'Сообщение при неудаче',
          editor: lexicalEditor({}),
          defaultValue: [
            {
              children: [
                { text: 'К сожалению, вы не набрали проходной балл. Попробуйте еще раз.' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Макет отображения',
      defaultValue: 'oneQuestionPerPage',
      options: [
        { label: 'Один вопрос на странице', value: 'oneQuestionPerPage' },
        { label: 'Все вопросы списком', value: 'allQuestionsList' },
      ],
    },
  ],
}
