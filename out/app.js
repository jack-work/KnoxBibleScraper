"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//var DOMParser = require("dom-parser");
const dom_parser_1 = __importDefault(require("dom-parser"));
const http = __importStar(require("http"));
const fs = __importStar(require("fs/promises"));
const assert_1 = __importDefault(require("assert"));
const websitePrefix = "http://catholicbible.online/knox";
const schemaFileName = "bibleSchema.json";
const outputFileName = "knox.json";
const parser = new dom_parser_1.default();
const translationId = "Knox";
const app = {
    getBible: () => __awaiter(void 0, void 0, void 0, function* () {
        const file = yield fs.open(schemaFileName, "r");
        const text = yield file.readFile();
        const bible = JSON.parse(text.toString());
        file.close();
        const verses = yield collectVerses(bible);
        yield writeVerses(verses);
    }),
};
app.getBible();
function collectVerses(bible) {
    return __awaiter(this, void 0, void 0, function* () {
        assert_1.default.ok(bible !== undefined);
        assert_1.default.ok(bible.Testaments !== undefined);
        return (yield Promise.all(bible.Testaments.map((testament) => __awaiter(this, void 0, void 0, function* () {
            assert_1.default.ok(testament.Books !== undefined);
            return (yield Promise.all(testament.Books.map((book) => __awaiter(this, void 0, void 0, function* () {
                var bookVerses = [];
                for (var chapterNumber = 1; true; chapterNumber++) {
                    try {
                        assert_1.default.ok(testament.id !== undefined);
                        assert_1.default.ok(book.book_id !== undefined);
                        assert_1.default.ok(book.book_name !== undefined);
                        bookVerses = bookVerses.concat(yield getChapterVerses([], websitePrefix, testament.id, book.book_id, book.book_name, chapterNumber));
                    }
                    catch (exception) {
                        // An exception is assumed to indicate that we are beyond the final chapter of the book and the inner iteration should stop
                        break;
                    }
                }
                return bookVerses;
            })))).flat();
        })))).flat();
    });
}
;
function getChapterVerses(verses, hostname, testamentId, bookId, bookName, chapter) {
    return __awaiter(this, void 0, void 0, function* () {
        assert_1.default.ok(verses !== undefined);
        assert_1.default.ok(hostname !== undefined);
        assert_1.default.ok(testamentId !== undefined);
        assert_1.default.ok(bookId !== undefined);
        assert_1.default.ok(bookName !== undefined);
        assert_1.default.ok(chapter !== undefined);
        return new Promise((resolve, reject) => {
            const url = hostname + "/" + testamentId + "/" + bookId + "/ch_" + chapter;
            const req = http.get(url, res => {
                console.log(`testamentId: ${testamentId}, bookId: ${bookId}, chapterNumber: ${chapter}, statusCode: ${res.statusCode}`);
                if (res.statusCode != 200) {
                    reject(res.statusCode);
                    return;
                }
                var response = "";
                res.on('data', (d) => __awaiter(this, void 0, void 0, function* () {
                    response = response.concat(d.toString());
                }));
                res.on('end', () => __awaiter(this, void 0, void 0, function* () {
                    var dom = parser.parseFromString(response, "text/html");
                    resolve(verses.concat(getVerses(dom, chapter, translationId, bookId, bookName)));
                }));
            });
            req.on('error', error => reject(error));
            req.end();
        });
    });
}
function getVerses(dom, chapter, translation_id, book_id, book_name) {
    var _a, _b;
    var verseElements = dom.getElementsByClassName("verses");
    if (verseElements == null) {
        return [];
    }
    return (_b = (_a = verseElements[0].getElementsByClassName("vers")) === null || _a === void 0 ? void 0 : _a.reduce((accumulant, verseElement) => {
        const verse = {
            book_id: book_id,
            book_name: book_name,
            chapter: chapter,
            translation_id: translationId
        };
        verse.book_id = book_id;
        verse.book_name = book_name;
        verse.chapter = chapter;
        verse.translation_id = translationId;
        const verseNumber = verseElement.getElementsByClassName("vers-no");
        if (!verseNumber) {
            return accumulant;
        }
        verse.verse = parseInt(verseNumber[0].innerHTML);
        if (!verse.verse) {
            return accumulant;
        }
        const verseContent = verseElement.getElementsByClassName("vers-content");
        if (!verseContent) {
            return accumulant;
        }
        verse.text = Array.from(removeTags(verseContent[0])).join();
        return accumulant.concat(verse);
    }, [])) !== null && _b !== void 0 ? _b : [];
}
function writeVerses(verses) {
    return __awaiter(this, void 0, void 0, function* () {
        // in qualified json
        yield fs.writeFile(outputFileName + "_qualified", JSON.stringify(verses));
        // in json with no top level array, just return separated objects
        yield fs.writeFile(outputFileName, verses.map(verse => JSON.stringify(verse)).join("\n"));
    });
}
function* removeTags(node) {
    var stack = [...node.childNodes];
    while (stack.length > 0) {
        var top = stack.shift();
        if ((top === null || top === void 0 ? void 0 : top.nodeName) === "#text" && !/^ *$/.test(top.text)) {
            // if the node is text and it's not all whitespace we emit it
            yield top.text;
        }
        else if (top) {
            stack = stack.concat(top.childNodes);
        }
    }
}
//# sourceMappingURL=app.js.map