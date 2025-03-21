"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsAdmin = exports.isAdmin = void 0;
var isAdmin = function (_a) {
    var user = _a.req.user;
    // Check if user exists and has admin role
    return Boolean((user === null || user === void 0 ? void 0 : user.role) === 'admin');
};
exports.isAdmin = isAdmin;
// You can also use this function directly
var checkIsAdmin = function (user) {
    return Boolean((user === null || user === void 0 ? void 0 : user.role) === 'admin');
};
exports.checkIsAdmin = checkIsAdmin;
