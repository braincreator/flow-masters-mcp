import { CollectionConfig } from 'payload/types';

export const Reviews: CollectionConfig<'reviews'> = {
    slug: 'reviews',
    admin: {
        useAsTitle: 'clientName',
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'clientName',
            type: 'text',
            required: true,
        },
        {
            name: 'companyName',
            type: 'text',
        },
        {
            name: 'rating',
            type: 'number',
            min: 1,
            max: 5,
            required: true,
        },
        {
            name: 'reviewText',
            type: 'textarea',
            required: true,
        },
        {
            name: 'clientPhoto',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'project',
            type: 'relationship',
            relationTo: 'solutions',
        }
    ]
};