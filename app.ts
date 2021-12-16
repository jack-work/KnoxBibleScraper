var DOMParser = require("dom-parser");
import * as http from 'http';
import * as fs from 'fs/promises';

class Verse {
    chapter!: number;
    verse!: number;
    text!: string;
    translation_id!: string;
    book_id!: string;
    book_name!: string;
}

class Bible {
    translation_id!: string;
    Testaments!: Testament[];
}

class Testament {
    id!: string;
    Books!: Book[];
}

class Book {
    book_id!: string;
    book_name!: string;
}

const websitePrefix = "http://catholicbible.online/knox";
const schemaFileName = "bibleSchema.json";
const outputFileName = "knox.json";
const parser = new DOMParser();
const translationId = "Knox";

const steps = {
    getBible: async () => {
        const file = await fs.open(schemaFileName, "r");
        const text = await file.readFile();
        const bible: Bible = JSON.parse(text.toString());
        file.close();

        await steps.collectVerses(bible);
    },
    collectVerses: async (bible: Bible) => {
        var verses = (await Promise.all(bible.Testaments.map(async testament => {
            return (await Promise.all(testament.Books.map(async book => {
                var bookVerses: Verse[] = [];
                for (var chapterNumber = 1; true; chapterNumber++) {
                    try {
                        bookVerses = bookVerses.concat(await steps.getChapterVerses([], websitePrefix, testament.id, book.book_id, book.book_name, chapterNumber));
                    } catch (exception) {
                        break;
                    }
                }
                return bookVerses;
            })
        )).flat()}))).flat();

        await steps.writeVerses(verses);
    },
    writeVerses: async (verses: Verse[]) => {
        // in qualified json
        await fs.writeFile(outputFileName + "_qualified", JSON.stringify(verses));

        // in json with no top level array, just return separated objects
        await fs.writeFile(outputFileName, verses.map(verse => JSON.stringify(verse)).join("\n"));
    },
    getChapterVerses: async (verses: Verse[], hostname: string, testamentId: string, bookId: string, bookName: string, chapter: number): Promise<Verse[]> => new Promise<Verse[]>((resolve, reject) => {
        const url = hostname + "/" + testamentId + "/" + bookId + "/ch_" + chapter;
        const req = http.get(url, res => {
            console.log(`testamentId: ${testamentId}, bookId: ${bookId}, chapterNumber: ${chapter}, statusCode: ${res.statusCode}`)

            if (res.statusCode != 200) {
                reject(res.statusCode);
                return;
            }
        
            var response = "";
            res.on('data', async d => {
                response = response.concat(d.toString());
            })

            res.on('end', async () => {
                var dom = parser.parseFromString(response, "text/html");
                resolve(verses.concat(steps.getVerses(dom, chapter, translationId, bookId, bookName)));
            })
        });

        req.on('error', error => reject(error))
        req.end();
    }),
    getVerses: (dom: DOMParser.Dom, chapter: number, translation_id: string, book_id: string, book_name: string): Verse[] => {
        var verseElements = dom.getElementsByClassName("verses");

        if (verseElements == null) {
            return [];
        }

        return verseElements[0].getElementsByClassName("vers")?.reduce((accumulant: Verse[], verseElement) => {
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
        }, []) ?? [];
    }
};
function* removeTags(node: DOMParser.Node): IterableIterator<string> {
    var stack: DOMParser.Node[] = [...node.childNodes];
    while (stack.length > 0) {
        var top = stack.shift();
        if (top?.nodeName === "#text" && !/^ *$/.test(top.text)) {
            // if the node is text and it's not all whitespace we emit it
            yield top.text;
        } else if (top) {
            stack = stack.concat(top.childNodes);
        }
    }
}
steps.getBible();