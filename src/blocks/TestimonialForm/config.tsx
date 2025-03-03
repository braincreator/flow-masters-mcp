import { Block } from 'payload';

const TestimonialFormBlock: Block = {
    slug: 'testimonialForm',
    labels: {
        singular: 'Форма отзыва',
        plural: 'Формы отзывов',
    },
    fields: [
        {
            name: 'formSettings',
            type: 'group',
            fields: [
                {
                    name: 'title',
                    type: 'text',
                    label: 'Заголовок формы',
                    required: true,
                    localized: true
                },
                {
                    name: 'description',
                    type: 'textarea',
                    label: 'Описание формы',
                    localized: true
                }
            ]
        },
        {
            name: 'fields',
            type: 'array',
            label: 'Поля формы',
            fields: [
                {
                    name: 'label',
                    type: 'text',
                    label: 'Название поля',
                    required: true,
                    localized: true
                },
                {
                    name: 'fieldType',
                    type: 'select',
                    label: 'Тип поля',
                    options: [
                        { label: 'Текст', value: 'text' },
                        { label: 'Текстовая область', value: 'textarea' },
                        { label: 'Оценка (1-5)', value: 'rating' },
                        { label: 'Компания', value: 'company' },
                        { label: 'Должность', value: 'position' }
                    ],
                    defaultValue: 'text'
                },
                {
                    name: 'required',
                    type: 'checkbox',
                    label: 'Обязательное поле',
                    defaultValue: false
                }
            ]
        },
        {
            name: 'successMessage',
            type: 'textarea',
            label: 'Сообщение об успешной отправке',
            localized: true,
            defaultValue: 'Спасибо за ваш отзыв!'
        }
    ]
};

export default TestimonialFormBlock;
