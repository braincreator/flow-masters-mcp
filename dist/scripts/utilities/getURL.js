"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientSideURL = exports.getServerSideURL = void 0;
var canUseDOM_1 = require("./canUseDOM");
var getServerSideURL = function () {
    var url = process.env.NEXT_PUBLIC_SERVER_URL;
    if (!url && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return "https://".concat(process.env.VERCEL_PROJECT_PRODUCTION_URL);
    }
    if (!url) {
        url = 'http://localhost:3000';
    }
    return url;
};
exports.getServerSideURL = getServerSideURL;
var getClientSideURL = function () {
    if (canUseDOM_1.default) {
        var protocol = window.location.protocol;
        var domain = window.location.hostname;
        var port = window.location.port;
        return "".concat(protocol, "//").concat(domain).concat(port ? ":".concat(port) : '');
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return "https://".concat(process.env.VERCEL_PROJECT_PRODUCTION_URL);
    }
    return process.env.NEXT_PUBLIC_SERVER_URL || '';
};
exports.getClientSideURL = getClientSideURL;
