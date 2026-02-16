// const { Book } = require("../db/init");

// async function createBook(isbn, title, author, publisher) {
//   let success = false;

//   if (isbn == null || title == null || author == null) {
//     throw new Error("Cannot empty isbn, title, and author.");
//   }

//   const newBook = await Book.create({
//     isbn: isbn,
//     title: title,
//     author: author,
//     publisher: publisher,
//   });

//   if (newBook && newBook.isbn) {
//     success = true;
//   }

//   return { success: success };
// }

// async function getBookByIsbn(isbn) {
//   let success = false;

//   if (isbn == null) {
//     throw new Error("Cannot empty isbn.");
//   }

//   const book = await Book.findOne({
//     where: {
//       isbn: isbn,
//     },
//   });

//   if (book && book.isbn) {
//     success = true;
//   }

//   return { success: success, book: book };
// }

// async function getBookByName(title) {
//   let success = false;

//   if (title == null) {
//     throw new Error("Cannot empty title.");
//   }

//   const book = await Book.findOne({
//     where: {
//       title: title,
//     },
//   });

//   if (book && book.isbn) {
//     success = true;
//   }

//   return { success: success, book: book };
// }

// async function getBookByAuthor(author) {
//   let success = false;

//   if (author == null) {
//     throw new Error("Cannot empty author.");
//   }

//   const book = await Book.findOne({
//     where: {
//       author: author,
//     },
//   });

//   if (book && book.isbn) {
//     success = true;
//   }

//   return { success: success, book: book };
// }

// async function updateBook(isbn, title, author, publisher) {
//   let success = false;

//   if (isbn == null || title == null || author == null || publisher == null) {
//     throw new Error("Cannot empty isbn, title, author, and publisher.");
//   }

//   const affectedRows = await Book.update(
//     {
//       title: title,
//       author: author,
//       publisher: publisher,
//     },
//     {
//       where: {
//         isbn: isbn,
//       },
//     },
//   );

//   if (affectedRows > 0) {
//     success = true;
//   }

//   return { success: success, affected_rows: affectedRows };
// }

// async function deleteBook(isbn) {
//   let success = false;

//   if (isbn == null) {
//     throw new Error("Cannot empty isbn.");
//   }

//   const affectedRows = await Book.destroy({
//     where: {
//       isbn: isbn,
//     },
//   });

//   if (affectedRows > 0) {
//     success = true;
//   }

//   return { success: success, affected_rows: affectedRows };
// }

// module.exports = {
//   createBook,
//   getBookByIsbn,
//   getBookByName,
//   getBookByAuthor,
//   updateBook,
//   deleteBook,
// };
