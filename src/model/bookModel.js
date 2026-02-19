const BookModel = require("../db/models/book");

const bookModel = new BookModel();

async function createBook(isbn, title, author) {
  if (isbn == null || title == null || author == null) {
    throw new Error("Cannot empty isbn, title, and author.");
  }

  await bookModel.create(title, author, isbn);

  return { success: true };
}

async function getBookByIsbn(isbn) {
  if (isbn == null) {
    throw new Error("Cannot empty isbn.");
  }

  const book = await bookModel.findOne(isbn);

  if (book && book.isbn) {
    return { success: true, book: book };
  }

  return { success: false, book: null };
}

async function getBookByName(title) {
  if (title == null) {
    throw new Error("Cannot empty title.");
  }

  const books = await bookModel.findAll();
  const book = books.find((b) => b.title === title);

  if (book && book.isbn) {
    return { success: true, book: book };
  }

  return { success: false, book: null };
}

async function getBookByAuthor(author) {
  if (author == null) {
    throw new Error("Cannot empty author.");
  }

  const books = await bookModel.findAll();
  // Find all books by the author, not just one.
  const foundBooks = books.filter((b) => b.author === author);

  if (foundBooks.length > 0) {
    return { success: true, book: foundBooks };
  }

  return { success: false, book: null };
}

async function updateBook(isbn, title, author) {
  if (isbn == null || title == null || author == null) {
    throw new Error("Cannot empty isbn, title, and author.");
  }

  const newData = { title, author };
  await bookModel.update(isbn, newData);

  return { success: true };
}

async function deleteBook(isbn) {
  if (isbn == null) {
    throw new Error("Cannot empty isbn.");
  }

  await bookModel.delete(isbn);

  return { success: true };
}

async function deleteAllBooks() {
  await bookModel.deleteAll();
  return { success: true };
}

async function getAllBooks() {
  const books = await bookModel.findAll();
  return books;
}

module.exports = {
  createBook,
  getBookByIsbn,
  getBookByName,
  getBookByAuthor,
  updateBook,
  deleteBook,
  deleteAllBooks,
  getAllBooks,
};
