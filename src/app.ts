//var DOMParser = require("dom-parser");
import DOMParser from 'dom-parser';
import * as http from 'http';
import * as fs from 'fs/promises';
import assert from 'assert';
import { Bible, Verse } from './bibleTypes';

const websitePrefix = "http://catholicbible.online/knox";
const schemaFileName = "bibleSchema.json";
const outputFileName = "knox.json";
const parser = new DOMParser();
const translationId = "Knox";

const app = {
    getBible: async () => {
        const file = await fs.open(schemaFileName, "r");
        const text = await file.readFile();
        const bible: Bible = JSON.parse(text.toString());
        file.close();

        const verses = await collectVerses(bible);
        await writeVerses(verses);
    },
};
app.getBible();

async function collectVerses(bible: Bible) {
    assert.ok(bible !== undefined);
    assert.ok(bible.Testaments !== undefined);

    return (await Promise.all(bible.Testaments.map(async testament => {
        assert.ok(testament.Books !== undefined);

        return (await Promise.all(testament.Books.map(async book => {
            var bookVerses: Verse[] = [];
            for (var chapterNumber = 1; true; chapterNumber++) {
                try {
                    assert.ok(testament.id !== undefined);
                    assert.ok(book.book_id !== undefined);
                    assert.ok(book.book_name !== undefined);

                    bookVerses = bookVerses.concat(await getChapterVerses([], websitePrefix, testament.id, book.book_id, book.book_name, chapterNumber));
                } catch (exception) {
                    // An exception is assumed to indicate that we are beyond the final chapter of the book and the inner iteration should stop
                    break;
                }
            }
            return bookVerses;
        })
    )).flat()}))).flat();
};

async function getChapterVerses(verses: Verse[], hostname: string, testamentId: string, bookId: string, bookName: string, chapter: number): Promise<Verse[]> {
    assert.ok(verses !== undefined);
    assert.ok(hostname !== undefined);
    assert.ok(testamentId !== undefined);
    assert.ok(bookId !== undefined);
    assert.ok(bookName !== undefined);
    assert.ok(chapter !== undefined);
    
    return new Promise<Verse[]>((resolve, reject) => {
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
                resolve(verses.concat(getVerses(dom, chapter, translationId, bookId, bookName)));
            })
        });

        req.on('error', error => reject(error))
        req.end();
    });
}

function getVerses(dom: DOMParser.Dom, chapter: number, translation_id: string, book_id: string, book_name: string): Verse[] {
    var verseElements = dom.getElementsByClassName("verses");

    if (verseElements == null) {
        return [];
    }

    return verseElements[0].getElementsByClassName("vers")?.reduce((accumulant: Verse[], verseElement) => {
        const verse: Verse = {
            book_id: book_id,
            book_name: book_name,
            chapter: chapter,
            translation_id: translationId
        }
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

async function writeVerses(verses: Verse[]) {
    // in qualified json
    await fs.writeFile(outputFileName + "_qualified", JSON.stringify(verses));

    // in json with no top level array, just return separated objects
    await fs.writeFile(outputFileName, verses.map(verse => JSON.stringify(verse)).join("\n"));
}

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