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
exports.Archive = void 0;
var richtext_lexical_1 = require("@payloadcms/richtext-lexical");
exports.Archive = {
    slug: 'archive',
    interfaceName: 'ArchiveBlock',
    fields: [
        {
            name: 'introContent',
            type: 'richText',
            editor: (0, richtext_lexical_1.lexicalEditor)({
                features: function (_a) {
                    var rootFeatures = _a.rootFeatures;
                    return __spreadArray(__spreadArray([], rootFeatures, true), [
                        (0, richtext_lexical_1.HeadingFeature)({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                        (0, richtext_lexical_1.FixedToolbarFeature)(),
                        (0, richtext_lexical_1.InlineToolbarFeature)(),
                    ], false);
                },
            }),
            label: 'Intro Content',
        },
        {
            name: 'populateBy',
            type: 'select',
            defaultValue: 'collection',
            options: [
                {
                    label: 'Collection',
                    value: 'collection',
                },
                {
                    label: 'Individual Selection',
                    value: 'selection',
                },
            ],
        },
        {
            name: 'relationTo',
            type: 'select',
            admin: {
                condition: function (_, siblingData) { return siblingData.populateBy === 'collection'; },
            },
            defaultValue: 'posts',
            label: 'Collections To Show',
            options: [
                {
                    label: 'Posts',
                    value: 'posts',
                },
            ],
        },
        {
            name: 'categories',
            type: 'relationship',
            admin: {
                condition: function (_, siblingData) { return siblingData.populateBy === 'collection'; },
            },
            hasMany: true,
            label: 'Categories To Show',
            relationTo: 'categories',
        },
        {
            name: 'limit',
            type: 'number',
            admin: {
                condition: function (_, siblingData) { return siblingData.populateBy === 'collection'; },
                step: 1,
            },
            defaultValue: 10,
            label: 'Limit',
        },
        {
            name: 'selectedDocs',
            type: 'relationship',
            admin: {
                condition: function (_, siblingData) { return siblingData.populateBy === 'selection'; },
            },
            hasMany: true,
            label: 'Selection',
            relationTo: ['posts'],
        },
    ],
    labels: {
        plural: 'Archives',
        singular: 'Archive',
    },
};
