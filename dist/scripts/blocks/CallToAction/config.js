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
exports.CallToAction = void 0;
var richtext_lexical_1 = require("@payloadcms/richtext-lexical");
var linkGroup_1 = require("../../fields/linkGroup");
exports.CallToAction = {
    slug: 'cta',
    interfaceName: 'CallToActionBlock',
    fields: [
        {
            name: 'richText',
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
            label: false,
        },
        (0, linkGroup_1.linkGroup)({
            appearances: ['default', 'outline'],
            overrides: {
                maxRows: 2,
            },
        }),
    ],
    labels: {
        plural: 'Calls to Action',
        singular: 'Call to Action',
    },
};
