"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.plugins = void 0;
var payload_cloud_1 = require("@payloadcms/payload-cloud");
var plugin_form_builder_1 = require("@payloadcms/plugin-form-builder");
var plugin_nested_docs_1 = require("@payloadcms/plugin-nested-docs");
var plugin_redirects_1 = require("@payloadcms/plugin-redirects");
var plugin_seo_1 = require("@payloadcms/plugin-seo");
var plugin_search_1 = require("@payloadcms/plugin-search");
var revalidateRedirects_1 = require("@/hooks/revalidateRedirects");
var richtext_lexical_1 = require("@payloadcms/richtext-lexical");
var fieldOverrides_1 = require("@/search/fieldOverrides");
var beforeSync_1 = require("@/search/beforeSync");
var getURL_1 = require("@/utilities/getURL");
var storage_s3_1 = require("@payloadcms/storage-s3");
var generateTitle = function (_a) {
    var doc = _a.doc;
    return (doc === null || doc === void 0 ? void 0 : doc.title) ? "".concat(doc.title, " | Payload Website Template") : 'Payload Website Template';
};
var generateURL = function (_a) {
    var doc = _a.doc;
    var url = (0, getURL_1.getServerSideURL)();
    return (doc === null || doc === void 0 ? void 0 : doc.slug) ? "".concat(url, "/").concat(doc.slug) : url;
};
exports.plugins = [
    (0, plugin_redirects_1.redirectsPlugin)({
        collections: ['pages', 'posts'], // Make sure this is an array
        admin: {
            group: 'Admin' // Optional: group in admin UI
        },
        overrides: {
            fields: function (_a) {
                var defaultFields = _a.defaultFields;
                return defaultFields.map(function (field) {
                    if ('name' in field && field.name === 'from') {
                        return __assign(__assign({}, field), { admin: {
                                description: 'You will need to rebuild the website when changing this field.',
                            } });
                    }
                    return field;
                });
            },
            hooks: {
                afterChange: [revalidateRedirects_1.revalidateRedirects],
            },
        },
    }),
    (0, plugin_nested_docs_1.nestedDocsPlugin)({
        collections: ['categories'],
        generateURL: function (docs) { return docs.reduce(function (url, doc) { return "".concat(url, "/").concat(doc.slug); }, ''); },
    }),
    (0, plugin_seo_1.seoPlugin)({
        generateTitle: generateTitle,
        generateURL: generateURL,
    }),
    (0, plugin_form_builder_1.formBuilderPlugin)({
        fields: {
            payment: false,
        },
        formOverrides: {
            fields: function (_a) {
                var defaultFields = _a.defaultFields;
                return defaultFields.map(function (field) {
                    if ('name' in field && field.name === 'confirmationMessage') {
                        return __assign(__assign({}, field), { editor: (0, richtext_lexical_1.lexicalEditor)({
                                features: function (_a) {
                                    var rootFeatures = _a.rootFeatures;
                                    return __spreadArray(__spreadArray([], rootFeatures, true), [
                                        (0, richtext_lexical_1.FixedToolbarFeature)(),
                                        (0, richtext_lexical_1.HeadingFeature)({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                                    ], false);
                                },
                            }) });
                    }
                    return field;
                });
            },
        },
    }),
    (0, plugin_search_1.searchPlugin)({
        collections: ['posts'],
        beforeSync: beforeSync_1.beforeSyncWithSearch,
        searchOverrides: {
            fields: function (_a) {
                var defaultFields = _a.defaultFields;
                return __spreadArray(__spreadArray([], defaultFields, true), fieldOverrides_1.searchFields, true);
            },
        },
    }),
    (0, payload_cloud_1.payloadCloudPlugin)(),
    (0, storage_s3_1.s3Storage)({
        collections: {
            media: {
                disableLocalStorage: true,
                disablePayloadAccessControl: true,
                generateFileURL: function (_a) {
                    var collection = _a.collection, filename = _a.filename, prefix = _a.prefix, size = _a.size;
                    var sizeName = (size === null || size === void 0 ? void 0 : size.name) || '';
                    var sizePrefix = sizeName ? "".concat(sizeName, "/") : '';
                    // Construct the correct S3 URL with the full bucket path
                    return "https://".concat(process.env.S3_BUCKET, ".").concat(process.env.S3_ENDPOINT, "/").concat(sizePrefix).concat(filename);
                },
            },
        },
        bucket: process.env.S3_BUCKET,
        config: {
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            },
            endpoint: "https://".concat(process.env.S3_ENDPOINT), // Make sure to include https://
            forcePathStyle: false, // Set this to false for virtual-hosted style URLs
            region: process.env.S3_REGION,
        },
    }),
];
