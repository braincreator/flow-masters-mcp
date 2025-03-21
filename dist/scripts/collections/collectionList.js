"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Categories_1 = require("./Categories");
var Media_1 = require("./Media");
var Testimonials_1 = require("./Testimonials");
var index_1 = require("./Pages/index");
var index_2 = require("./Posts/index");
var index_3 = require("./Reviews/index");
var index_4 = require("./Solutions/index");
var index_5 = require("./Users/index");
var collections = [
    Categories_1.Categories,
    Media_1.Media,
    Testimonials_1.Testimonials,
    index_1.Pages,
    index_2.Posts,
    index_3.Reviews,
    index_4.Solutions,
    index_5.Users
];
exports.default = collections;
