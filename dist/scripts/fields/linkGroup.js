"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkGroup = void 0;
var deepMerge_1 = require("@/utilities/deepMerge");
var link_1 = require("./link");
var linkGroup = function (_a) {
    var _b = _a === void 0 ? {} : _a, appearances = _b.appearances, _c = _b.overrides, overrides = _c === void 0 ? {} : _c;
    var generatedLinkGroup = {
        name: 'links',
        type: 'array',
        fields: [
            (0, link_1.link)({
                appearances: appearances,
            }),
        ],
        admin: {
            initCollapsed: true,
        },
    };
    return (0, deepMerge_1.default)(generatedLinkGroup, overrides);
};
exports.linkGroup = linkGroup;
