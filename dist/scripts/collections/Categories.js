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
exports.Categories = void 0;
var anyone_1 = require("../access/anyone");
var authenticated_1 = require("../access/authenticated");
var slug_1 = require("@/fields/slug");
exports.Categories = {
    slug: 'categories',
    access: {
        create: authenticated_1.authenticated,
        delete: authenticated_1.authenticated,
        read: anyone_1.anyone,
        update: authenticated_1.authenticated,
    },
    admin: {
        useAsTitle: 'title',
    },
    fields: __spreadArray([
        {
            name: 'title',
            type: 'text',
            required: true,
        }
    ], (0, slug_1.slugField)(), true),
};
