"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Footer = void 0;
var link_1 = require("@/fields/link");
var revalidateFooter_1 = require("./hooks/revalidateFooter");
exports.Footer = {
    slug: 'footer',
    access: {
        read: function () { return true; },
    },
    fields: [
        {
            name: 'mainNavItems',
            label: 'Main Navigation Items',
            type: 'array',
            localized: true,
            fields: [
                (0, link_1.link)({
                    appearances: false,
                    localized: true,
                }),
            ],
            maxRows: 12,
            admin: {
                initCollapsed: true,
                components: {
                    RowLabel: '@/Footer/RowLabel#RowLabel',
                },
            },
        },
        {
            name: 'bottomNavItems',
            label: 'Bottom Navigation Items',
            type: 'array',
            localized: true,
            fields: [
                (0, link_1.link)({
                    appearances: false,
                    localized: true,
                }),
            ],
            maxRows: 4,
            admin: {
                initCollapsed: true,
                components: {
                    RowLabel: '@/Footer/RowLabel#RowLabel',
                },
            },
        },
    ],
    hooks: {
        afterChange: [revalidateFooter_1.revalidateFooter],
    },
};
