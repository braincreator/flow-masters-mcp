"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticated = void 0;
var authenticated = function (_a) {
    var user = _a.req.user;
    return Boolean(user);
};
exports.authenticated = authenticated;
