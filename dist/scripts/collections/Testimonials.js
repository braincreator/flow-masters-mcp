"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Testimonials = void 0;
var authenticated_1 = require("../access/authenticated");
exports.Testimonials = {
    slug: 'testimonials',
    access: {
        create: authenticated_1.authenticated,
        read: function () { return true; },
        update: authenticated_1.authenticated,
        delete: authenticated_1.authenticated,
    },
    fields: [
        {
            name: 'author',
            type: 'text',
            required: true,
        },
        {
            name: 'authorTitle',
            type: 'text',
        },
        {
            name: 'quote',
            type: 'textarea',
            required: true,
        },
        {
            name: 'avatar',
            type: 'upload',
            relationTo: 'media',
        },
    ],
};
