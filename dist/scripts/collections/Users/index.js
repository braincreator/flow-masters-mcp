"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
var authenticated_1 = require("../../access/authenticated");
var isAdmin_1 = require("@/access/isAdmin");
exports.Users = {
    slug: 'users',
    auth: true,
    access: {
        admin: isAdmin_1.isAdmin,
        read: authenticated_1.authenticated,
        create: authenticated_1.authenticated,
        update: authenticated_1.authenticated,
        delete: authenticated_1.authenticated,
    },
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'email', 'role'],
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'role',
            type: 'select',
            required: true,
            defaultValue: 'customer',
            options: [
                {
                    label: 'Admin',
                    value: 'admin',
                },
                {
                    label: 'Customer',
                    value: 'customer',
                },
            ],
            access: {
                update: function (_a) {
                    var user = _a.req.user;
                    return Boolean((user === null || user === void 0 ? void 0 : user.role) === 'admin');
                },
            },
        },
    ],
    timestamps: true,
};
