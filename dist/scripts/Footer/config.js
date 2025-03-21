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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Footer = void 0;
var link_1 = require("../fields/link");
var revalidateFooter_1 = require("./hooks/revalidateFooter");
exports.Footer = {
    slug: 'footer',
    admin: {
        group: 'Globals',
    },
    access: {
        read: function () { return true; },
        update: function () { return true; },
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
        beforeChange: [
            function (_a) {
                var data = _a.data, req = _a.req;
                var finalData = __assign({}, data);
                // Parse _payload if it exists
                if (data._payload && typeof data._payload === 'string') {
                    try {
                        var parsedPayload_1 = JSON.parse(data._payload);
                        // Handle navigation items specifically
                        if (Array.isArray(parsedPayload_1.bottomNavItems)) {
                            finalData.bottomNavItems = parsedPayload_1.bottomNavItems;
                        }
                        if (Array.isArray(parsedPayload_1.mainNavItems)) {
                            finalData.mainNavItems = parsedPayload_1.mainNavItems;
                        }
                        // Copy over other fields except navigation items
                        Object.keys(parsedPayload_1).forEach(function (key) {
                            if (key !== 'bottomNavItems' && key !== 'mainNavItems') {
                                finalData[key] = parsedPayload_1[key];
                            }
                        });
                        // Remove the _payload field
                        delete finalData._payload;
                    }
                    catch (e) {
                        req.payload.logger.error('Error parsing _payload:', e);
                    }
                }
                // Ensure arrays are initialized if undefined
                if (!Array.isArray(finalData.bottomNavItems)) {
                    finalData.bottomNavItems = [];
                }
                if (!Array.isArray(finalData.mainNavItems)) {
                    finalData.mainNavItems = [];
                }
                req.payload.logger.info('Footer beforeChange - final data:', JSON.stringify(finalData, null, 2));
                return finalData;
            }
        ],
        afterChange: [
            function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var doc = _b.doc, req = _b.req;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            req.payload.logger.info('Footer afterChange - saved doc:', JSON.stringify(doc, null, 2));
                            return [4 /*yield*/, (0, revalidateFooter_1.revalidateFooter)({ doc: doc, req: req })];
                        case 1: return [2 /*return*/, _c.sent()];
                    }
                });
            }); }
        ],
    },
};
