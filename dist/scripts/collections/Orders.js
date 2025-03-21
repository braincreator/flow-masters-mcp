"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orders = void 0;
var isAdmin_1 = require("../access/isAdmin");
exports.Orders = {
    slug: 'orders',
    admin: {
        useAsTitle: 'orderNumber',
        defaultColumns: ['orderNumber', 'customer', 'total', 'status', 'createdAt'],
    },
    access: {
        read: function (_a) {
            var user = _a.req.user;
            if ((0, isAdmin_1.isAdmin)({ req: { user: user } }))
                return true;
            if (user)
                return {
                    customer: {
                        equals: user.id,
                    },
                };
            return false;
        },
        create: function () { return true; },
        update: isAdmin_1.isAdmin,
        delete: isAdmin_1.isAdmin,
    },
    fields: [
        {
            name: 'orderNumber',
            type: 'text',
            required: true,
            admin: {
                readOnly: true,
            },
        },
        {
            name: 'customer',
            type: 'relationship',
            relationTo: 'users',
            required: true,
        },
        {
            name: 'items',
            type: 'array',
            required: true,
            fields: [
                {
                    name: 'product',
                    type: 'relationship',
                    relationTo: 'products',
                    required: true,
                },
                {
                    name: 'price',
                    type: 'number',
                    required: true,
                },
            ],
        },
        {
            name: 'total',
            type: 'number',
            required: true,
        },
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'pending',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Paid', value: 'paid' },
                { label: 'Failed', value: 'failed' },
            ],
        },
        {
            name: 'paymentId',
            type: 'text',
            admin: {
                readOnly: true,
            },
        },
        {
            name: 'createdAt',
            type: 'date',
            admin: {
                readOnly: true,
            },
        },
    ],
};
