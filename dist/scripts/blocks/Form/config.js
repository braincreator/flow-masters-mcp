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
exports.FormBlock = void 0;
var richtext_lexical_1 = require("@payloadcms/richtext-lexical");
exports.FormBlock = {
    slug: 'formBlock',
    interfaceName: 'FormBlock',
    fields: [
        {
            name: 'form',
            type: 'relationship',
            relationTo: 'forms',
            required: true,
        },
        {
            name: 'enableIntro',
            type: 'checkbox',
            label: 'Enable Intro Content',
        },
        {
            name: 'introContent',
            type: 'richText',
            admin: {
                condition: function (_, _a) {
                    var enableIntro = _a.enableIntro;
                    return Boolean(enableIntro);
                },
            },
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
    ],
    graphQL: {
        singularName: 'FormBlock',
    },
    labels: {
        plural: 'Form Blocks',
        singular: 'Form Block',
    },
};
