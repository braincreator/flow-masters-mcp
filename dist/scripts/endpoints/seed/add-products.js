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
exports.addProductsAndUpdateHeader = void 0;
var test_products_1 = require("./test-products");
var addProductsAndUpdateHeader = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var existingHeader, demoImage, mediaResult, err_1, _i, testProducts_1, productData, existingProduct, productDoc, createdProduct, err_2, error_1;
    var payload = _b.payload, req = _b.req;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 15, , 16]);
                payload.logger.info('Adding products and updating header...');
                return [4 /*yield*/, payload.findGlobal({
                        slug: 'header',
                    })
                    // Create demo image if not exists (for product thumbnails)
                ];
            case 1:
                existingHeader = _c.sent();
                demoImage = void 0;
                _c.label = 2;
            case 2:
                _c.trys.push([2, 4, , 5]);
                return [4 /*yield*/, payload.find({
                        collection: 'media',
                        where: {
                            filename: {
                                equals: 'product-demo-image.jpg',
                            },
                        },
                    })];
            case 3:
                mediaResult = _c.sent();
                demoImage = mediaResult.docs[0];
                return [3 /*break*/, 5];
            case 4:
                err_1 = _c.sent();
                payload.logger.warn('Error finding demo image:', err_1);
                return [3 /*break*/, 5];
            case 5:
                payload.logger.info('— Adding products...');
                _i = 0, testProducts_1 = test_products_1.testProducts;
                _c.label = 6;
            case 6:
                if (!(_i < testProducts_1.length)) return [3 /*break*/, 14];
                productData = testProducts_1[_i];
                _c.label = 7;
            case 7:
                _c.trys.push([7, 12, , 13]);
                return [4 /*yield*/, payload.find({
                        collection: 'products',
                        where: {
                            slug: {
                                equals: productData.slug,
                            },
                        },
                    })];
            case 8:
                existingProduct = _c.sent();
                if (!(existingProduct.docs.length === 0)) return [3 /*break*/, 10];
                productDoc = {
                    title: {
                        en: productData.title.en,
                        ru: productData.title.ru,
                    },
                    category: productData.category || 'n8n',
                    description: [{
                            children: [{ text: productData.description.en }]
                        }],
                    price: productData.price,
                    slug: productData.slug,
                    status: 'published',
                    meta: {
                        title: productData.title.en,
                        description: productData.description.en,
                    },
                };
                if (demoImage) {
                    productDoc['thumbnail'] = demoImage.id;
                }
                return [4 /*yield*/, payload.create({
                        collection: 'products',
                        data: productDoc,
                    })];
            case 9:
                createdProduct = _c.sent();
                payload.logger.info("Created product: ".concat(createdProduct.id));
                return [3 /*break*/, 11];
            case 10:
                payload.logger.info("Product ".concat(productData.slug, " already exists, skipping..."));
                _c.label = 11;
            case 11: return [3 /*break*/, 13];
            case 12:
                err_2 = _c.sent();
                payload.logger.error("Error creating product ".concat(productData.slug, ":"), err_2);
                throw err_2; // Re-throw to be caught by outer try-catch
            case 13:
                _i++;
                return [3 /*break*/, 6];
            case 14:
                payload.logger.info('✅ Products update completed');
                return [3 /*break*/, 16];
            case 15:
                error_1 = _c.sent();
                payload.logger.error('Error in addProductsAndUpdateHeader:', error_1);
                throw error_1;
            case 16: return [2 /*return*/];
        }
    });
}); };
exports.addProductsAndUpdateHeader = addProductsAndUpdateHeader;
