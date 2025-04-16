const express = require('express');
const app = express();

app.use(express.json());

app.SearchBookOfISBN = async (req, res) => {

    const isbn13Codes = req.body.isbn13_codes;

    if (!isbn13Codes || !Array.isArray(isbn13Codes)) {
        return res.status(400).send({ result: 'FAILED', message: 'Invalid ISBN codes' });
    }

    const titles = [];

    for (let i = 0; i < isbn13Codes.length; i++) {
        const isbn = isbn13Codes[i];
        const URL = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.ISBN_APIKEY}`;

        try {
            const response = await fetch(URL);
            const json = await response.json();

            if (response.ok && json.totalItems > 0) {
                const volumeInfo = json.items[0].volumeInfo;
                const title = volumeInfo.title || 'UNKNOWN_TITLE';
                const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'UNKNOWN_AUTHOR';
                titles.push({ isbn, title, authors });
            } else {
                titles.push({ isbn, title: 'NOT_FOUND', authors: 'NOT_FOUND' });
            }
        } catch (error) {
            console.error(`Error fetching data for ISBN ${isbn}:`, error);
            titles.push({ isbn, title: 'ERROR', authors: 'ERROR' });
        }
    }

    res.send({ result: 'SUCCESS', titles });
};

module.exports = app;