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
exports.Banner = void 0;
var richtext_lexical_1 = require("@payloadcms/richtext-lexical");
exports.Banner = {
    slug: 'banner',
    fields: [
        {
            name: 'style',
            type: 'select',
            defaultValue: 'info',
            options: [
                { label: 'Info', value: 'info' },
                { label: 'Warning', value: 'warning' },
                { label: 'Error', value: 'error' },
                { label: 'Success', value: 'success' },
            ],
            required: true,
        },
        {
            name: 'content',
            type: 'richText',
            editor: (0, richtext_lexical_1.lexicalEditor)({
                features: function (_a) {
                    var rootFeatures = _a.rootFeatures;
                    return __spreadArray(__spreadArray([], rootFeatures, true), [(0, richtext_lexical_1.FixedToolbarFeature)(), (0, richtext_lexical_1.InlineToolbarFeature)()], false);
                },
            }),
            label: false,
            required: true,
        },
    ],
    interfaceName: 'BannerBlock',
};
