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
exports.link = exports.appearanceOptions = void 0;
var deepMerge_1 = require("src/utilities/deepMerge");
exports.appearanceOptions = {
    default: {
        label: 'Default',
        value: 'default',
    },
    outline: {
        label: 'Outline',
        value: 'outline',
    },
};
var link = function (_a) {
    var _b = _a === void 0 ? {} : _a, appearances = _b.appearances, _c = _b.disableLabel, disableLabel = _c === void 0 ? false : _c, _d = _b.overrides, overrides = _d === void 0 ? {} : _d;
    var linkResult = {
        name: 'link',
        type: 'group',
        admin: {
            hideGutter: true,
        },
        fields: [
            {
                type: 'row',
                fields: [
                    {
                        name: 'type',
                        type: 'radio',
                        admin: {
                            layout: 'horizontal',
                            width: '50%',
                        },
                        defaultValue: 'reference',
                        options: [
                            {
                                label: 'Internal link',
                                value: 'reference',
                            },
                            {
                                label: 'Custom URL',
                                value: 'custom',
                            },
                        ],
                    },
                    {
                        name: 'newTab',
                        type: 'checkbox',
                        admin: {
                            style: {
                                alignSelf: 'flex-end',
                            },
                            width: '50%',
                        },
                        label: 'Open in new tab',
                    },
                ],
            },
        ],
    };
    var linkTypes = [
        {
            name: 'reference',
            type: 'relationship',
            admin: {
                condition: function (_, siblingData) { return (siblingData === null || siblingData === void 0 ? void 0 : siblingData.type) === 'reference'; },
            },
            label: 'Document to link to',
            relationTo: ['pages', 'posts'],
            required: true,
        },
        {
            name: 'url',
            type: 'text',
            admin: {
                condition: function (_, siblingData) { return (siblingData === null || siblingData === void 0 ? void 0 : siblingData.type) === 'custom'; },
            },
            label: 'Custom URL',
            required: true,
        },
    ];
    if (!disableLabel) {
        linkTypes.map(function (linkType) { return (__assign(__assign({}, linkType), { admin: __assign(__assign({}, linkType.admin), { width: '50%' }) })); });
        linkResult.fields.push({
            type: 'row',
            fields: __spreadArray(__spreadArray([], linkTypes, true), [
                {
                    name: 'label',
                    type: 'text',
                    admin: {
                        width: '50%',
                    },
                    label: 'Label',
                    required: true
                },
            ], false),
        });
    }
    else {
        linkResult.fields = __spreadArray(__spreadArray([], linkResult.fields, true), linkTypes, true);
    }
    if (appearances !== false) {
        var appearanceOptionsToUse = [exports.appearanceOptions.default, exports.appearanceOptions.outline];
        if (appearances) {
            appearanceOptionsToUse = appearances.map(function (appearance) { return exports.appearanceOptions[appearance]; });
        }
        linkResult.fields.push({
            name: 'appearance',
            type: 'select',
            admin: {
                description: 'Choose how the link should be rendered.',
            },
            defaultValue: 'default',
            options: appearanceOptionsToUse,
        });
    }
    return (0, deepMerge_1.default)(linkResult, overrides);
};
exports.link = link;
