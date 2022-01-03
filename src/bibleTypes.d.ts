export interface Verse {
    chapter?: number;
    verse?: number;
    text?: string;
    translation_id?: string;
    book_id?: string;
    book_name?: string;
}

export interface Bible {
    translation_id?: string;
    Testaments?: Testament[];
}

export interface Testament {
    id?: string;
    Books?: Book[];
}

export interface Book {
    book_id?: string;
    book_name?: string;
}