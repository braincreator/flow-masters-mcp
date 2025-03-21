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
exports.Media = void 0;
var richtext_lexical_1 = require("@payloadcms/richtext-lexical");
var path_1 = require("path");
var url_1 = require("url");
var anyone_1 = require("../access/anyone");
var authenticated_1 = require("../access/authenticated");
var filename = (0, url_1.fileURLToPath)(import.meta.url);
var dirname = path_1.default.dirname(filename);
exports.Media = {
    slug: 'media',
    access: {
        create: authenticated_1.authenticated,
        delete: authenticated_1.authenticated,
        read: anyone_1.anyone,
        update: authenticated_1.authenticated,
    },
    admin: {
        useAsTitle: 'filename',
        defaultColumns: ['filename', 'alt', 'updatedAt'],
        preview: function (doc) {
            var _a, _b;
            // Ensure we're using the thumbnail URL for preview
            if ((_b = (_a = doc === null || doc === void 0 ? void 0 : doc.sizes) === null || _a === void 0 ? void 0 : _a.thumbnail) === null || _b === void 0 ? void 0 : _b.url) {
                return doc.sizes.thumbnail.url;
            }
            return doc.url;
        },
    },
    upload: {
        disableLocalStorage: true,
        adminThumbnail: function (_a) {
            var _b, _c;
            var doc = _a.doc;
            // Ensure we're using the correct thumbnail URL
            if ((_c = (_b = doc === null || doc === void 0 ? void 0 : doc.sizes) === null || _b === void 0 ? void 0 : _b.thumbnail) === null || _c === void 0 ? void 0 : _c.url) {
                return doc.sizes.thumbnail.url;
            }
            return doc.url;
        },
        focalPoint: true,
        imageSizes: [
            {
                name: 'thumbnail',
                width: 300,
                // withoutEnlargement: true,
            },
            {
                name: 'square',
                width: 500,
                height: 500,
                crop: 'center',
            },
            {
                name: 'small',
                width: 600,
            },
            {
                name: 'medium',
                width: 900,
            },
            {
                name: 'large',
                width: 1400,
            },
            {
                name: 'xlarge',
                width: 1920,
            },
            {
                name: 'og',
                width: 1200,
                height: 630,
                crop: 'center',
            },
        ],
    },
    fields: [
        {
            name: 'alt',
            type: 'text',
        },
        {
            name: 'caption',
            type: 'richText',
            editor: (0, richtext_lexical_1.lexicalEditor)({
                features: function (_a) {
                    var rootFeatures = _a.rootFeatures;
                    return __spreadArray(__spreadArray([], rootFeatures, true), [(0, richtext_lexical_1.FixedToolbarFeature)(), (0, richtext_lexical_1.InlineToolbarFeature)()], false);
                },
            }),
        },
    ],
};
