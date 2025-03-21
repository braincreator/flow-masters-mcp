"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedOrPublished = void 0;
var authenticatedOrPublished = function (_a) {
    var user = _a.req.user;
    if (user) {
        return true;
    }
    return {
        _status: {
            equals: 'published',
        },
    };
};
exports.authenticatedOrPublished = authenticatedOrPublished;
