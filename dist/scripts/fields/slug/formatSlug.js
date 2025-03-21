"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSlugHook = exports.formatSlug = void 0;
var formatSlug = function (val) {
    return val
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
        .toLowerCase();
};
exports.formatSlug = formatSlug;
var formatSlugHook = function (fallback) {
    return function (_a) {
        var data = _a.data, operation = _a.operation, value = _a.value;
        if (typeof value === 'string') {
            return (0, exports.formatSlug)(value);
        }
        if (operation === 'create' || !(data === null || data === void 0 ? void 0 : data.slug)) {
            var fallbackData = (data === null || data === void 0 ? void 0 : data[fallback]) || (data === null || data === void 0 ? void 0 : data[fallback]);
            if (fallbackData && typeof fallbackData === 'string') {
                return (0, exports.formatSlug)(fallbackData);
            }
        }
        return value;
    };
};
exports.formatSlugHook = formatSlugHook;
