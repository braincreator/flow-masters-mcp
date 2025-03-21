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
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugField = void 0;
var formatSlug_1 = require("./formatSlug");
var slugField = function (fieldToUse, overrides) {
    if (fieldToUse === void 0) { fieldToUse = 'title'; }
    if (overrides === void 0) { overrides = {}; }
    var slugOverrides = overrides.slugOverrides, checkboxOverrides = overrides.checkboxOverrides;
    var checkBoxField = __assign({ name: 'slugLock', type: 'checkbox', defaultValue: true, admin: {
            hidden: true,
            position: 'sidebar',
        } }, checkboxOverrides);
    // @ts-expect-error - ts mismatch Partial<TextField> with TextField
    var slugField = __assign(__assign({ name: 'slug', type: 'text', index: true, label: 'Slug' }, (slugOverrides || {})), { hooks: {
            // Kept this in for hook or API based updates
            beforeValidate: [(0, formatSlug_1.formatSlugHook)(fieldToUse)],
        }, admin: __assign(__assign({ position: 'sidebar' }, ((slugOverrides === null || slugOverrides === void 0 ? void 0 : slugOverrides.admin) || {})), { components: {
                Field: {
                    path: '@/fields/slug/SlugComponent#SlugComponent',
                    clientProps: {
                        fieldToUse: fieldToUse,
                        checkboxFieldPath: checkBoxField.name,
                    },
                },
            } }) });
    return [slugField, checkBoxField];
};
exports.slugField = slugField;
