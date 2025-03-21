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
exports.Content = void 0;
var richtext_lexical_1 = require("@payloadcms/richtext-lexical");
var link_1 = require("@/fields/link");
var columnFields = [
    {
        name: 'size',
        type: 'select',
        defaultValue: 'oneThird',
        options: [
            {
                label: 'One Third',
                value: 'oneThird',
            },
            {
                label: 'Half',
                value: 'half',
            },
            {
                label: 'Two Thirds',
                value: 'twoThirds',
            },
            {
                label: 'Full',
                value: 'full',
            },
        ],
    },
    {
        name: 'richText',
        type: 'richText',
        editor: (0, richtext_lexical_1.lexicalEditor)({
            features: function (_a) {
                var rootFeatures = _a.rootFeatures;
                return __spreadArray(__spreadArray([], rootFeatures, true), [
                    (0, richtext_lexical_1.HeadingFeature)({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                    (0, richtext_lexical_1.FixedToolbarFeature)(),
                    (0, richtext_lexical_1.InlineToolbarFeature)(),
                ], false);
            },
        }),
        label: false,
    },
    {
        name: 'enableLink',
        type: 'checkbox',
    },
    (0, link_1.link)({
        overrides: {
            admin: {
                condition: function (_, _a) {
                    var enableLink = _a.enableLink;
                    return Boolean(enableLink);
                },
            },
        },
    }),
];
exports.Content = {
    slug: 'content',
    interfaceName: 'ContentBlock',
    fields: [
        {
            name: 'columns',
            type: 'array',
            admin: {
                initCollapsed: true,
            },
            fields: columnFields,
        },
    ],
};
