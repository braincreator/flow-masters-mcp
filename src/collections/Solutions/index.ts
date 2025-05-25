import { CollectionConfig } from 'payload';

export const Solutions: CollectionConfig<'solutions'>= {
    slug: 'solutions',
   labels: {
        singular: 'Solution',
        plural: 'Solutions',
    },
    admin: {
        useAsTitle: 'name',
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'description',
            type: 'richText',
            required: true,
        },
        {
            name: 'featuredImage',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'tags',
            type: 'array',
            fields: [
                {
                    name: 'tag',
                    type: 'text',
                }
            ]
        },
        {
            name: 'toolsUsed',
            type: 'array',
            fields: [
                {
                    name: 'tool',
                    type: 'text',
                }
            ]
        },
        {
            name: 'pricing',
            type: 'group',
            fields: [
                {
                    name: 'price',
                    type: 'number',
                    required: true,
                    min: 0,
                    localized: true,
                    admin: {
                        description: 'Price in locale currency (USD for English, RUB for Russian)'
                    }
                },
                {
                    name: 'discountPercentage',
                    type: 'number',
                    min: 0,
                    max: 100,
                    admin: {
                        description: 'Discount percentage (0-100)'
                    }
                },
                {
                    name: 'finalPrice',
                    type: 'number',
                    admin: {
                        description: 'Final price after discount (calculated automatically)',
                        readOnly: true,
                    },
                }
            ]
        }
    ]
};