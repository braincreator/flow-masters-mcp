"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Code = void 0;
exports.Code = {
    slug: 'code',
    interfaceName: 'CodeBlock',
    fields: [
        {
            name: 'language',
            type: 'select',
            defaultValue: 'typescript',
            options: [
                {
                    label: 'Typescript',
                    value: 'typescript',
                },
                {
                    label: 'Javascript',
                    value: 'javascript',
                },
                {
                    label: 'CSS',
                    value: 'css',
                },
            ],
        },
        {
            name: 'code',
            type: 'code',
            label: false,
            required: true,
        },
    ],
};
