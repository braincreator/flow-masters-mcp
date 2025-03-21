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
exports.Pages = void 0;
var authenticated_1 = require("../../access/authenticated");
var authenticatedOrPublished_1 = require("../../access/authenticatedOrPublished");
var config_1 = require("../../blocks/ArchiveBlock/config");
var config_2 = require("../../blocks/CallToAction/config");
var config_3 = require("../../blocks/Content/config");
var config_4 = require("../../blocks/Form/config");
var config_5 = require("../../blocks/MediaBlock/config");
var config_6 = require("@/heros/config");
var slug_1 = require("@/fields/slug");
var populatePublishedAt_1 = require("../../hooks/populatePublishedAt");
var generatePreviewPath_1 = require("@/utilities/generatePreviewPath");
var revalidatePage_1 = require("./hooks/revalidatePage");
var fields_1 = require("@payloadcms/plugin-seo/fields");
exports.Pages = {
    slug: 'pages',
    access: {
        create: authenticated_1.authenticated,
        delete: authenticated_1.authenticated,
        read: authenticatedOrPublished_1.authenticatedOrPublished,
        update: authenticated_1.authenticated,
    },
    // This config controls what's populated by default when a page is referenced
    // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
    // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
    defaultPopulate: {
        title: true,
        slug: true,
    },
    admin: {
        defaultColumns: ['title', 'slug', 'updatedAt'],
        livePreview: {
            url: function (_a) {
                var data = _a.data, req = _a.req;
                var locale = req.locale || 'ru';
                return (0, generatePreviewPath_1.generatePreviewPath)({
                    slug: typeof (data === null || data === void 0 ? void 0 : data.slug) === 'string' ? data.slug : '',
                    collection: 'pages',
                    req: req,
                    locale: locale,
                });
            },
            visualEditor: {
                enabled: true,
                toolbarOptions: {
                    enabled: true,
                    placement: 'top',
                },
                blockControls: {
                    enabled: true,
                    position: 'left',
                },
            },
        },
        preview: function (data, _a) {
            var req = _a.req;
            var locale = req.locale || 'ru';
            return (0, generatePreviewPath_1.generatePreviewPath)({
                slug: typeof (data === null || data === void 0 ? void 0 : data.slug) === 'string' ? data.slug : '',
                collection: 'pages',
                req: req,
                locale: locale,
            });
        },
        useAsTitle: 'title',
    },
    fields: __spreadArray([
        {
            name: 'title',
            type: 'text',
            required: true,
            localized: true,
        },
        {
            type: 'tabs',
            tabs: [
                {
                    fields: [
                        __assign(__assign({}, config_6.hero), { localized: true }),
                    ],
                    label: 'Hero',
                },
                {
                    fields: [
                        {
                            name: 'layout',
                            type: 'blocks',
                            blocks: [config_2.CallToAction, config_3.Content, config_5.MediaBlock, config_1.Archive, config_4.FormBlock],
                            required: true,
                            localized: true,
                            admin: {
                                initCollapsed: true,
                            },
                        },
                    ],
                    label: 'Content',
                },
                {
                    name: 'meta',
                    label: 'SEO',
                    fields: [
                        (0, fields_1.OverviewField)({
                            titlePath: 'meta.title',
                            descriptionPath: 'meta.description',
                            imagePath: 'meta.image',
                        }),
                        (0, fields_1.MetaTitleField)({
                            hasGenerateFn: true,
                            localized: true,
                        }),
                        (0, fields_1.MetaImageField)({
                            relationTo: 'media',
                        }),
                        (0, fields_1.MetaDescriptionField)({
                            localized: true,
                        }),
                        (0, fields_1.PreviewField)({
                            // if the `generateUrl` function is configured
                            hasGenerateFn: true,
                            // field paths to match the target field for data
                            titlePath: 'meta.title',
                            descriptionPath: 'meta.description',
                        }),
                    ],
                },
            ],
        },
        {
            name: 'publishedAt',
            type: 'date',
            admin: {
                position: 'sidebar',
            },
        }
    ], (0, slug_1.slugField)(), true),
    hooks: {
        afterChange: [revalidatePage_1.revalidatePage],
        beforeChange: [populatePublishedAt_1.populatePublishedAt],
        afterDelete: [revalidatePage_1.revalidateDelete],
    },
    versions: {
        drafts: {
            autosave: {
                interval: 100, // We set this interval for optimal live preview
            },
            schedulePublish: true,
        },
        maxPerDoc: 50,
    },
};
