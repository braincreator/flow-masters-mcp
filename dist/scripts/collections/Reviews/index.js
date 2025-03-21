"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reviews = void 0;
exports.Reviews = {
    slug: 'reviews',
    labels: {
        singular: 'Review',
        plural: 'Reviews',
    },
    admin: {
        useAsTitle: 'clientName',
    },
    access: {
        read: function () { return true; },
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
