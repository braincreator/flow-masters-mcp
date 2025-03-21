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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
// storage-adapter-import-placeholder
var db_mongodb_1 = require("@payloadcms/db-mongodb");
var sharp_1 = require("sharp"); // sharp-import
var path_1 = require("path");
var payload_1 = require("payload");
var url_1 = require("url");
// Get the directory name properly in ESM
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var Categories_1 = require("./collections/Categories");
var Media_1 = require("./collections/Media");
var Pages_1 = require("./collections/Pages");
var Posts_1 = require("./collections/Posts");
var Users_1 = require("./collections/Users");
var Solutions_1 = require("./collections/Solutions");
var config_1 = require("./Footer/config");
var config_2 = require("./Header/config");
var plugins_1 = require("./plugins");
var defaultLexical_1 = require("@/fields/defaultLexical");
var getURL_1 = require("./utilities/getURL");
var Products_1 = require("./collections/Products");
var Orders_1 = require("./collections/Orders");
var add_products_1 = require("./endpoints/add-products");
console.log('Initializing Payload with DATABASE_URI:', process.env.DATABASE_URI);
exports.default = (0, payload_1.buildConfig)({
    admin: {
        components: {
            // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
            // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
            beforeLogin: ['@/components/BeforeLogin'],
            // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
            // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
            beforeDashboard: ['@/components/BeforeDashboard'],
        },
        importMap: {
            baseDir: path_1.default.resolve(__dirname),
        },
        user: Users_1.Users.slug,
        livePreview: {
            breakpoints: [
                {
                    label: 'Mobile',
                    name: 'mobile',
                    width: 375,
                    height: 667,
                },
                {
                    label: 'Tablet',
                    name: 'tablet',
                    width: 768,
                    height: 1024,
                },
                {
                    label: 'Desktop',
                    name: 'desktop',
                    width: 1440,
                    height: 900,
                },
            ],
            // Add visual editor configuration
            // visualEditor: {
            //   enabled: true,
            //   toolbarOptions: {
            //     enabled: true,
            //     placement: 'top',
            //   },
            //   blockControls: {
            //     enabled: true,
            //     position: 'left',
            //   },
            // },
        },
    },
    // This config helps us configure global or default features that the other editors can inherit
    editor: defaultLexical_1.defaultLexical,
    db: (0, db_mongodb_1.mongooseAdapter)({
        url: process.env.DATABASE_URI || '',
        connectOptions: {
            directConnection: true,
            serverSelectionTimeoutMS: 5000,
        },
    }),
    onInit: function (payload) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('DATABASE_URI:', process.env.DATABASE_URI);
            return [2 /*return*/];
        });
    }); },
    localization: {
        locales: [
            {
                label: 'English',
                code: 'en',
            },
            {
                label: 'Russian',
                code: 'ru',
            },
        ],
        defaultLocale: 'ru',
        fallback: true,
    },
    collections: [Categories_1.Categories, Media_1.Media, Pages_1.Pages, Posts_1.Posts, Users_1.Users, Solutions_1.Solutions, Products_1.Products, Orders_1.Orders],
    cors: [(0, getURL_1.getServerSideURL)()].filter(Boolean),
    globals: [config_2.Header, config_1.Footer],
    plugins: __spreadArray([], plugins_1.plugins, true),
    secret: process.env.PAYLOAD_SECRET,
    sharp: sharp_1.default,
    typescript: {
        outputFile: path_1.default.resolve(__dirname, 'payload-types.ts'),
    },
    jobs: {
        access: {
            run: function (_a) {
                var req = _a.req;
                // Allow logged in users to execute this endpoint (default)
                if (req.user)
                    return true;
                // If there is no logged in user, then check
                // for the Vercel Cron secret to be present as an
                // Authorization header:
                var authHeader = req.headers.get('authorization');
                return authHeader === "Bearer ".concat(process.env.CRON_SECRET);
            },
        },
        tasks: [],
    },
    upload: {
        limits: {
            fileSize: 5000000, // 5MB, adjust as needed
        },
    },
    endpoints: [
        {
            path: '/api/add-products',
            method: 'post',
            handler: add_products_1.default,
        },
        // ... other endpoints
    ],
});
