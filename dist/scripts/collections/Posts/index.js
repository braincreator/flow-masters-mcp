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
exports.Posts = void 0;
var richtext_lexical_1 = require("@payloadcms/richtext-lexical");
var authenticated_1 = require("../../access/authenticated");
var authenticatedOrPublished_1 = require("../../access/authenticatedOrPublished");
var config_1 = require("../../blocks/Banner/config");
var config_2 = require("../../blocks/Code/config");
var config_3 = require("../../blocks/MediaBlock/config");
var generatePreviewPath_1 = require("../../utilities/generatePreviewPath");
var populateAuthors_1 = require("./hooks/populateAuthors");
var revalidatePost_1 = require("./hooks/revalidatePost");
var fields_1 = require("@payloadcms/plugin-seo/fields");
var slug_1 = require("@/fields/slug");
exports.Posts = {
    slug: 'posts',
    access: {
        create: authenticated_1.authenticated,
        delete: authenticated_1.authenticated,
        read: authenticatedOrPublished_1.authenticatedOrPublished,
        update: authenticated_1.authenticated,
    },
    // This config controls what's populated by default when a post is referenced
    // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
    // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
    defaultPopulate: {
        title: true,
        slug: true,
        categories: true,
        meta: {
            image: true,
            description: true,
        },
    },
    admin: {
        defaultColumns: ['title', 'slug', 'updatedAt'],
        livePreview: {
            url: function (_a) {
                var data = _a.data, req = _a.req;
                var path = (0, generatePreviewPath_1.generatePreviewPath)({
                    slug: typeof (data === null || data === void 0 ? void 0 : data.slug) === 'string' ? data.slug : '',
                    collection: 'posts',
                    req: req,
                });
                return path;
            },
        },
        preview: function (data, _a) {
            var req = _a.req;
            return (0, generatePreviewPath_1.generatePreviewPath)({
                slug: typeof (data === null || data === void 0 ? void 0 : data.slug) === 'string' ? data.slug : '',
                collection: 'posts',
                req: req,
            });
        },
        useAsTitle: 'title',
    },
    fields: __spreadArray([
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            type: 'tabs',
            tabs: [
                {
                    fields: [
                        {
                            name: 'heroImage',
                            type: 'upload',
                            relationTo: 'media',
                        },
                        {
                            name: 'content',
                            type: 'richText',
                            editor: (0, richtext_lexical_1.lexicalEditor)({
                                features: function (_a) {
                                    var rootFeatures = _a.rootFeatures;
                                    return __spreadArray(__spreadArray([], rootFeatures, true), [
                                        (0, richtext_lexical_1.HeadingFeature)({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                                        (0, richtext_lexical_1.BlocksFeature)({ blocks: [config_1.Banner, config_2.Code, config_3.MediaBlock] }),
                                        (0, richtext_lexical_1.FixedToolbarFeature)(),
                                        (0, richtext_lexical_1.InlineToolbarFeature)(),
                                        (0, richtext_lexical_1.HorizontalRuleFeature)(),
                                    ], false);
                                },
                            }),
                            label: false,
                            required: true,
                        },
                    ],
                    label: 'Content',
                },
                {
                    fields: [
                        {
                            name: 'relatedPosts',
                            type: 'relationship',
                            admin: {
                                position: 'sidebar',
                            },
                            filterOptions: function (_a) {
                                var id = _a.id;
                                return {
                                    id: {
                                        not_in: [id],
                                    },
                                };
                            },
                            hasMany: true,
                            relationTo: 'posts',
                        },
                        {
                            name: 'categories',
                            type: 'relationship',
                            admin: {
                                position: 'sidebar',
                            },
                            hasMany: true,
                            relationTo: 'categories',
                        },
                    ],
                    label: 'Meta',
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
                        }),
                        (0, fields_1.MetaImageField)({
                            relationTo: 'media',
                        }),
                        (0, fields_1.MetaDescriptionField)({}),
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
                date: {
                    pickerAppearance: 'dayAndTime',
                },
                position: 'sidebar',
            },
            hooks: {
                beforeChange: [
                    function (_a) {
                        var siblingData = _a.siblingData, value = _a.value;
                        if (siblingData._status === 'published' && !value) {
                            return new Date();
                        }
                        return value;
                    },
                ],
            },
        },
        {
            name: 'authors',
            type: 'relationship',
            admin: {
                position: 'sidebar',
            },
            hasMany: true,
            relationTo: 'users',
        },
        // This field is only used to populate the user data via the `populateAuthors` hook
        // This is because the `user` collection has access control locked to protect user privacy
        // GraphQL will also not return mutated user data that differs from the underlying schema
        {
            name: 'populatedAuthors',
            type: 'array',
            access: {
                update: function () { return false; },
            },
            admin: {
                disabled: true,
                readOnly: true,
            },
            fields: [
                {
                    name: 'id',
                    type: 'text',
                },
                {
                    name: 'name',
                    type: 'text',
                },
            ],
        }
    ], (0, slug_1.slugField)(), true),
    hooks: {
        afterChange: [revalidatePost_1.revalidatePost],
        afterRead: [populateAuthors_1.populateAuthors],
        afterDelete: [revalidatePost_1.revalidateDelete],
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
