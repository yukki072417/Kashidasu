const path = require("path");
const { writeJsonFile, readJsonFile } = require("../operation");

const repositoryPath = path.join(__dirname, "../../../repository");

class BookModel {
  async create(title, author, isbn) {
    const books = await readJsonFile(repositoryPath, "books.json");
    if (books.find((book) => book.isbn === isbn)) {
      throw new Error("Book with this ISBN already exists.");
    }
    books.push({ title, author, isbn, isBorrowed: false });
    await writeJsonFile(repositoryPath, "books.json", books);
  }

  async findOne(isbn) {
    const books = await readJsonFile(repositoryPath, "books.json");
    return books.find((book) => book.isbn === isbn);
  }

  async findAll() {
    const books = await readJsonFile(repositoryPath, "books.json");
    return books;
  }

  async update(isbn, newData) {
    const books = await readJsonFile(repositoryPath, "books.json");
    const index = books.findIndex((book) => book.isbn === isbn);
    if (index === -1) {
      throw new Error("Book not found.");
    }
    books[index] = { ...books[index], ...newData };
    await writeJsonFile(repositoryPath, "books.json", books);
  }

  async delete(isbn) {
    let books = await readJsonFile(repositoryPath, "books.json");
    const initialLength = books.length;
    books = books.filter((book) => book.isbn !== isbn);
    if (books.length === initialLength) {
      throw new Error("Book not found.");
    }
    await writeJsonFile(repositoryPath, "books.json", books);
  }
}

module.exports = BookModel;
