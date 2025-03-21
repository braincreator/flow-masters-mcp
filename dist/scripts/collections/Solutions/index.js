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
exports.Solutions = void 0;
exports.Solutions = {
    slug: 'solutions',
    labels: {
        singular: 'Solution',
        plural: 'Solutions',
    },
    admin: {
        useAsTitle: 'name',
    },
    access: {
        read: function () { return true; },
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'description',
            type: 'richText',
            required: true,
        },
        {
            name: 'featuredImage',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'tags',
            type: 'array',
            fields: [
                {
                    name: 'tag',
                    type: 'text',
                }
            ]
        },
        {
            name: 'toolsUsed',
            type: 'array',
            fields: [
                {
                    name: 'tool',
                    type: 'text',
                }
            ]
        },
        {
            name: 'pricing',
            type: 'group',
            fields: [
                {
                    name: 'basePrice',
                    type: 'number',
                    required: true,
                },
                {
                    name: 'discountPercentage',
                    type: 'number',
                    min: 0,
                    max: 100,
                    admin: {
                        description: 'Discount percentage (0-100)'
                    }
                },
                {
                    name: 'finalPrice',
                    type: 'number',
                    admin: {
                        hidden: true,
                    },
                    hooks: {
                        beforeChange: [
                            function (_a) {
                                var data = _a.data;
                                if (data && data.pricing && data.pricing.basePrice) {
                                    var basePrice = data.pricing.basePrice;
                                    var discountPercentage = data.pricing.discountPercentage || 0;
                                    return __assign(__assign({}, data), { pricing: __assign(__assign({}, data.pricing), { finalPrice: basePrice * (1 - discountPercentage / 100) }) });
                                }
                                return data;
                            }
                        ]
                    }
                }
            ]
        }
    ]
};
