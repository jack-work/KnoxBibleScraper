import DOMParser from 'dom-parser';
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
        var promises: Promise<Verse[]>[] = [];
        for (var testament of bible.Testaments) {
            for (var book of testament.Books) {
                // Iterate over chapter numbers starting at one.  Go until there is an error.  An error indicates a bad response.
                // A bad response indicates the chapter doesn't exist.  If a chapter does not exist, we have exhausted a book
                // and we should move to the next book iteration.
                for (var chapterNumber = 1; await steps.checkChapterExists(websitePrefix, testament.id, book.book_id, chapterNumber); chapterNumber++) {
                    var promise = steps.getChapterVerses([], websitePrefix, testament.id, book.book_id, book.book_name, chapterNumber)
                    promises = promises.concat(promise);
                }
            }
        }

        const verses = (await Promise.all(promises)).flat();
        await steps.writeVerses(verses);
    },
    writeVerses: async (verses: Verse[]) => {
        // in qualified json
        //await fs.writeFile(outputFileName + "_qualified", JSON.stringify(verses));

        // in json with no top level array, just return separated objects
        await fs.writeFile(outputFileName, verses.map(verse => JSON.stringify(verse)).join("\n"));
    },
    checkChapterExists: async (hostname: string, testamentId: string, bookId: string, chapter: number): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
        const url = hostname + "/" + testamentId + "/" + bookId + "/ch_" + chapter;
        http.get(url, res => resolve(res.statusCode === 200)).on('error', error => reject(error)).end();
    }),
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

        return verseElements[0].getElementsByClassName("vers")?.map(verseElement => {
            const verse = new Verse();
            verse.book_id = book_id;
            verse.book_name = book_name;
            verse.chapter = chapter;
            verse.translation_id = translationId;

            const verseNumber = verseElement.getElementsByClassName("vers-no");
            if (verseNumber == null)
            {
                throw new Error("Verse number doesn't exist");
            }
            verse.verse = parseInt(verseNumber[0].innerHTML);

            const verseContent = verseElement.getElementsByClassName("vers-content");
            if (verseContent == null)
            {
                throw new Error("Verse number doesn't exist");
            }
            verse.text = Array.from(removeTags(verseContent[0])).join();

            return verse;
        }) ?? [];
    }
};
function* removeTags(node: DOMParser.Node): IterableIterator<string> {
    var stack: DOMParser.Node[] = [...node.childNodes];
    while (stack.length > 0) {
        var top = stack.shift();
        if (top?.nodeName === "#text" && !/^ *$/.test(top.text)) {
            // if the node is text and it's not all whitespace we emit it
            yield top.text;
        } else if (top && top.childNodes?.length > 1) {
            // if the length is equal to one, we may have an infinite loop
            stack.concat(top.childNodes);
        }
    }
}
steps.getBible();