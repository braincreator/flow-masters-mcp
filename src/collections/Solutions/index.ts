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
                    name: 'basePrice',
                    type: 'number',
                    required: true,
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
                        hidden: true,
                    },
                    hooks: {
                        beforeChange: [
                            ({ data }) => {
                                if (data && data.pricing && data.pricing.basePrice) {
                                    const basePrice = data.pricing.basePrice;
                                    const discountPercentage = data.pricing.discountPercentage || 0;
                                    return {
                                        ...data,
                                        pricing: {
                                            ...data.pricing,
                                            finalPrice: basePrice * (1 - discountPercentage / 100)
                                        }
                                    };
                                }
                                return data;
                            }
                        ]
                    }
                }
            ]
        }
    ]
};