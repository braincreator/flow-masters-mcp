"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPreviewURL = void 0;
var generatePreviewPath_1 = require("./generatePreviewPath");
var formatPreviewURL = function (collection, doc, locale, req) {
    var slug = typeof (doc === null || doc === void 0 ? void 0 : doc.slug) === 'string' ? doc.slug : '';
    // Generate preview path based on collection type
    switch (collection) {
        case 'posts':
            return (0, generatePreviewPath_1.generatePreviewPath)({
                collection: collection,
                slug: "/posts/".concat(slug),
                locale: locale,
                req: req
            });
        case 'products':
            return (0, generatePreviewPath_1.generatePreviewPath)({
                collection: collection,
                slug: "/products/".concat(slug),
                locale: locale,
                req: req
            });
        case 'pages':
            return (0, generatePreviewPath_1.generatePreviewPath)({
                collection: collection,
                slug: slug === 'home' ? '/' : "/".concat(slug),
                locale: locale,
                req: req
            });
        default:
            return '/';
    }
};
exports.formatPreviewURL = formatPreviewURL;
