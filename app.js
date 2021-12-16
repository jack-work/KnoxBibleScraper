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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
var DOMParser = require("dom-parser");
var http = require("http");
var fs = require("fs/promises");
var Verse = /** @class */ (function () {
    function Verse() {
    }
    return Verse;
}());
var Bible = /** @class */ (function () {
    function Bible() {
    }
    return Bible;
}());
var Testament = /** @class */ (function () {
    function Testament() {
    }
    return Testament;
}());
var Book = /** @class */ (function () {
    function Book() {
    }
    return Book;
}());
var websitePrefix = "http://catholicbible.online/knox";
var schemaFileName = "bibleSchema.json";
var outputFileName = "knox.json";
var parser = new DOMParser();
var translationId = "Knox";
var steps = {
    getBible: function () { return __awaiter(void 0, void 0, void 0, function () {
        var file, text, bible;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.open(schemaFileName, "r")];
                case 1:
                    file = _a.sent();
                    return [4 /*yield*/, file.readFile()];
                case 2:
                    text = _a.sent();
                    bible = JSON.parse(text.toString());
                    file.close();
                    return [4 /*yield*/, steps.collectVerses(bible)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); },
    collectVerses: function (bible) { return __awaiter(void 0, void 0, void 0, function () {
        var verses;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(bible.Testaments.map(function (testament) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.all(testament.Books.map(function (book) { return __awaiter(void 0, void 0, void 0, function () {
                                        var bookVerses, chapterNumber, _a, _b, exception_1;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0:
                                                    bookVerses = [];
                                                    chapterNumber = 1;
                                                    _c.label = 1;
                                                case 1:
                                                    if (!true) return [3 /*break*/, 6];
                                                    _c.label = 2;
                                                case 2:
                                                    _c.trys.push([2, 4, , 5]);
                                                    _b = (_a = bookVerses).concat;
                                                    return [4 /*yield*/, steps.getChapterVerses([], websitePrefix, testament.id, book.book_id, book.book_name, chapterNumber)];
                                                case 3:
                                                    bookVerses = _b.apply(_a, [_c.sent()]);
                                                    return [3 /*break*/, 5];
                                                case 4:
                                                    exception_1 = _c.sent();
                                                    return [3 /*break*/, 6];
                                                case 5:
                                                    chapterNumber++;
                                                    return [3 /*break*/, 1];
                                                case 6: return [2 /*return*/, bookVerses];
                                            }
                                        });
                                    }); }))];
                                case 1: return [2 /*return*/, (_a.sent()).flat()];
                            }
                        });
                    }); }))];
                case 1:
                    verses = (_a.sent()).flat();
                    return [4 /*yield*/, steps.writeVerses(verses)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); },
    writeVerses: function (verses) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // in qualified json
                return [4 /*yield*/, fs.writeFile(outputFileName + "_qualified", JSON.stringify(verses))];
                case 1:
                    // in qualified json
                    _a.sent();
                    // in json with no top level array, just return separated objects
                    return [4 /*yield*/, fs.writeFile(outputFileName, verses.map(function (verse) { return JSON.stringify(verse); }).join("\n"))];
                case 2:
                    // in json with no top level array, just return separated objects
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); },
    getChapterVerses: function (verses, hostname, testamentId, bookId, bookName, chapter) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var url = hostname + "/" + testamentId + "/" + bookId + "/ch_" + chapter;
                    var req = http.get(url, function (res) {
                        console.log("testamentId: ".concat(testamentId, ", bookId: ").concat(bookId, ", chapterNumber: ").concat(chapter, ", statusCode: ").concat(res.statusCode));
                        if (res.statusCode != 200) {
                            reject(res.statusCode);
                            return;
                        }
                        var response = "";
                        res.on('data', function (d) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                response = response.concat(d.toString());
                                return [2 /*return*/];
                            });
                        }); });
                        res.on('end', function () { return __awaiter(void 0, void 0, void 0, function () {
                            var dom;
                            return __generator(this, function (_a) {
                                dom = parser.parseFromString(response, "text/html");
                                resolve(verses.concat(steps.getVerses(dom, chapter, translationId, bookId, bookName)));
                                return [2 /*return*/];
                            });
                        }); });
                    });
                    req.on('error', function (error) { return reject(error); });
                    req.end();
                })];
        });
    }); },
    getVerses: function (dom, chapter, translation_id, book_id, book_name) {
        var _a, _b;
        var verseElements = dom.getElementsByClassName("verses");
        if (verseElements == null) {
            return [];
        }
        return (_b = (_a = verseElements[0].getElementsByClassName("vers")) === null || _a === void 0 ? void 0 : _a.reduce(function (accumulant, verseElement) {
            var verse = new Verse();
            verse.book_id = book_id;
            verse.book_name = book_name;
            verse.chapter = chapter;
            verse.translation_id = translationId;
            var verseNumber = verseElement.getElementsByClassName("vers-no");
            if (!verseNumber) {
                return accumulant;
            }
            verse.verse = parseInt(verseNumber[0].innerHTML);
            if (!verse.verse) {
                return accumulant;
            }
            var verseContent = verseElement.getElementsByClassName("vers-content");
            if (!verseContent) {
                return accumulant;
            }
            verse.text = Array.from(removeTags(verseContent[0])).join();
            return accumulant.concat(verse);
        }, [])) !== null && _b !== void 0 ? _b : [];
    }
};
function removeTags(node) {
    var stack, top;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                stack = __spreadArray([], node.childNodes, true);
                _a.label = 1;
            case 1:
                if (!(stack.length > 0)) return [3 /*break*/, 5];
                top = stack.shift();
                if (!((top === null || top === void 0 ? void 0 : top.nodeName) === "#text" && !/^ *$/.test(top.text))) return [3 /*break*/, 3];
                // if the node is text and it's not all whitespace we emit it
                return [4 /*yield*/, top.text];
            case 2:
                // if the node is text and it's not all whitespace we emit it
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                if (top) {
                    stack = stack.concat(top.childNodes);
                }
                _a.label = 4;
            case 4: return [3 /*break*/, 1];
            case 5: return [2 /*return*/];
        }
    });
}
steps.getBible();
