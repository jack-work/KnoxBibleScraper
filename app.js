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
Object.defineProperty(exports, "__esModule", { value: true });
var DOMParser = require("dom-parser");
const http = __importStar(require("http"));
const fs = __importStar(require("fs/promises"));
class Verse {
}
class Bible {
}
class Testament {
}
class Book {
}
const websitePrefix = "http://catholicbible.online/knox";
const schemaFileName = "bibleSchema.json";
const outputFileName = "knox.json";
const parser = new DOMParser();
const translationId = "Knox";
const steps = {
    getBible: () => __awaiter(void 0, void 0, void 0, function* () {
        const file = yield fs.open(schemaFileName, "r");
        const text = yield file.readFile();
        const bible = JSON.parse(text.toString());
        file.close();
        yield steps.collectVerses(bible);
    }),
    collectVerses: (bible) => __awaiter(void 0, void 0, void 0, function* () {
        var verses = (yield Promise.all(bible.Testaments.map((testament) => __awaiter(void 0, void 0, void 0, function* () {
            return (yield Promise.all(testament.Books.map((book) => __awaiter(void 0, void 0, void 0, function* () {
                var bookVerses = [];
                for (var chapterNumber = 1; true; chapterNumber++) {
                    try {
                        bookVerses = bookVerses.concat(yield steps.getChapterVerses([], websitePrefix, testament.id, book.book_id, book.book_name, chapterNumber));
                    }
                    catch (exception) {
                        break;
                    }
                }
                return bookVerses;
            })))).flat();
        })))).flat();
        yield steps.writeVerses(verses);
    }),
    writeVerses: (verses) => __awaiter(void 0, void 0, void 0, function* () {
        // in qualified json
        yield fs.writeFile(outputFileName + "_qualified", JSON.stringify(verses));
        // in json with no top level array, just return separated objects
        yield fs.writeFile(outputFileName, verses.map(verse => JSON.stringify(verse)).join("\n"));
    }),
    getChapterVerses: (verses, hostname, testamentId, bookId, bookName, chapter) => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const url = hostname + "/" + testamentId + "/" + bookId + "/ch_" + chapter;
            const req = http.get(url, res => {
                console.log(`testamentId: ${testamentId}, bookId: ${bookId}, chapterNumber: ${chapter}, statusCode: ${res.statusCode}`);
                if (res.statusCode != 200) {
                    reject(res.statusCode);
                    return;
                }
                var response = "";
                res.on('data', (d) => __awaiter(void 0, void 0, void 0, function* () {
                    response = response.concat(d.toString());
                }));
                res.on('end', () => __awaiter(void 0, void 0, void 0, function* () {
                    var dom = parser.parseFromString(response, "text/html");
                    resolve(verses.concat(steps.getVerses(dom, chapter, translationId, bookId, bookName)));
                }));
            });
            req.on('error', error => reject(error));
            req.end();
        });
    }),
    getVerses: (dom, chapter, translation_id, book_id, book_name) => {
        var _a, _b;
        var verseElements = dom.getElementsByClassName("verses");
        if (verseElements == null) {
            return [];
        }
        return (_b = (_a = verseElements[0].getElementsByClassName("vers")) === null || _a === void 0 ? void 0 : _a.reduce((accumulant, verseElement) => {
            const verse = new Verse();
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
};
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
steps.getBible();
//# sourceMappingURL=app.js.map