"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePreviewPath = void 0;
var getURL_1 = require("./getURL");
var generatePreviewPath = function (_a) {
    var collection = _a.collection, slug = _a.slug, locale = _a.locale;
    var url = (0, getURL_1.getServerSideURL)();
    var previewURL = new URL('/next/preview', url);
    // Add required search params
    previewURL.searchParams.append('collection', collection);
    previewURL.searchParams.append('slug', slug || '');
    previewURL.searchParams.append('previewSecret', process.env.PREVIEW_SECRET || '');
    // Add locale if provided
    if (locale) {
        previewURL.searchParams.append('locale', locale);
    }
    return previewURL.toString();
};
exports.generatePreviewPath = generatePreviewPath;
