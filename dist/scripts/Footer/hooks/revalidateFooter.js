"use strict";
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
exports.revalidateFooter = void 0;
var revalidateFooter = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var serverUrl, revalidateUrl, response, errorText, result, e_1, error_1;
    var doc = _b.doc, _c = _b.req, payload = _c.payload, context = _c.context;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!!context.disableRevalidate) return [3 /*break*/, 11];
                _d.label = 1;
            case 1:
                _d.trys.push([1, 10, , 11]);
                serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
                revalidateUrl = "".concat(serverUrl.replace(/\/$/, ''), "/api/revalidate");
                payload.logger.info('Revalidating footer with doc:', JSON.stringify(doc, null, 2));
                return [4 /*yield*/, fetch(revalidateUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            collection: 'globals',
                            slug: 'footer',
                            data: doc,
                            path: '/',
                            tag: 'global_footer'
                        }),
                    })];
            case 2:
                response = _d.sent();
                if (!!response.ok) return [3 /*break*/, 4];
                return [4 /*yield*/, response.text()];
            case 3:
                errorText = _d.sent();
                throw new Error("Revalidation failed with status ".concat(response.status, ": ").concat(errorText));
            case 4: return [4 /*yield*/, response.json()];
            case 5:
                result = _d.sent();
                payload.logger.info('Footer revalidation successful:', result);
                _d.label = 6;
            case 6:
                _d.trys.push([6, 8, , 9]);
                return [4 /*yield*/, fetch("".concat(serverUrl), {
                        method: 'GET',
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache'
                        }
                    })];
            case 7:
                _d.sent();
                return [3 /*break*/, 9];
            case 8:
                e_1 = _d.sent();
                payload.logger.warn('Error clearing cache:', e_1);
                return [3 /*break*/, 9];
            case 9: return [3 /*break*/, 11];
            case 10:
                error_1 = _d.sent();
                payload.logger.error('Footer revalidation error:', error_1);
                throw error_1;
            case 11: return [2 /*return*/, doc];
        }
    });
}); };
exports.revalidateFooter = revalidateFooter;
