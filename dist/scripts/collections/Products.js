"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Products = void 0;
var isAdmin_1 = require("../access/isAdmin");
var slug_1 = require("../fields/slug");
var populatePublishedAt_1 = require("../hooks/populatePublishedAt");
var formatPreviewURL_1 = require("../utilities/formatPreviewURL");
var revalidatePage_1 = require("../utilities/revalidatePage");
exports.Products = {
    slug: 'products',
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'price', 'category', 'publishedAt', 'status'],
        preview: function (doc, _a) {
            var locale = _a.locale;
            return (0, formatPreviewURL_1.formatPreviewURL)('products', doc, locale);
        },
    },
    access: {
        read: function () { return true; },
        create: isAdmin_1.isAdmin,
        update: isAdmin_1.isAdmin,
        delete: isAdmin_1.isAdmin,
    },
    hooks: {
        afterChange: [revalidatePage_1.revalidatePage],
        beforeChange: [populatePublishedAt_1.populatePublishedAt],
    },
    versions: {
        drafts: true,
    },
    fields: __spreadArray([
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            name: 'category',
            type: 'select',
            required: true,
            options: [
                { label: 'N8N Workflows', value: 'n8n' },
                { label: 'Make.com Workflows', value: 'make' },
                { label: 'Tutorials', value: 'tutorials' },
                { label: 'Courses', value: 'courses' },
            ],
        },
        {
            name: 'price',
            type: 'number',
            required: true,
            min: 0,
        },
        {
            name: 'description',
            type: 'richText',
            required: true,
        },
        {
            name: 'features',
            type: 'array',
            fields: [
                {
                    name: 'feature',
                    type: 'text',
                },
            ],
        },
        {
            name: 'downloadUrl',
            type: 'text',
            admin: {
                description: 'URL to download the digital product (only visible to customers after purchase)',
            },
        },
        {
            name: 'demoUrl',
            type: 'text',
            admin: {
                description: 'URL to preview/demo the product',
            },
        },
        {
            name: 'thumbnail',
            type: 'upload',
            relationTo: 'media',
            required: false,
        },
        {
            name: 'gallery',
            type: 'array',
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    required: false,
                },
            ],
        },
        {
            name: 'publishedAt',
            type: 'date',
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'draft',
            options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
            ],
            admin: {
                position: 'sidebar',
            },
        }
    ], (0, slug_1.slugField)(), true),
};
