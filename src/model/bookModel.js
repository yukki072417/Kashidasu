const { Book, sequelize } = require('../db/init');

async function createBook(isbn, name, author) {
  let success = false;

  if (isbn == null || name == null || author == null){
    throw new Error('Cannot empty isbn, name, and author.');
  }

  const newBook = await sequelize.transaction(async (t) => {
    return Book.create({
      isbn: isbn,
      name: name,
      author: author
    }, { transaction: t });
  });

  if(newBook && newBook.isbn){
    success = true;
  }

  return {success: success};
}

async function getBookByIsbn(isbn) {
  let success = false;

  if (isbn == null){
    throw new Error('Cannot empty isbn, name, and author.');
  }

  const book = await sequelize.transaction(async (t) => {
    return Book.findOne({
      where: {
        isbn: isbn
      }
    }, { transaction: t });
  });

  if(book && book.isbn){
    success = true;
  }

  return { success: success, book: book };

}

async function getBookByName(name) {
  let success = false;

  if (name == null){
    throw new Error('Cannot empty name.');
  }

  const book = await sequelize.transaction(async (t) => {
    return Book.findOne({
      where: {
        name: name
      }
    }, { transaction: t });
  });

  if(book && book.name){
    success = true;
  }

  return {success: success, book: book};
}

async function getBookByAuthor(author) {
  let success = false;

  if (author == null){
    throw new Error('Cannot empty author.');
  }

  const book = await sequelize.transaction(async (t) => {
    return Book.findOne({
      where: {
        author: author
      }
    }, { transaction: t });
  });

  if(book && book.author){
    success = true;
  }

  return {success: success, book: book};
}

async function updateBook(isbn, name, author) {
  let success = false;

  if(isbn == null || name == null || author == null){
    throw new Error('Cannot empty isbn, name, and author.');
  }

  const affectedRows = await sequelize.transaction(async (t) => {
    return Book.update({
      name: name,
      author: author
    }, {
      where: {
        isbn: isbn
      }
    }, { transaction: t });
  });

  if(affectedRows.length > 0){
    success = true;
  }

  return {success: success, affected_rows: affectedRows.length};

}

async function deleteBook(isbn) {
  let success = false;

  if(isbn == null){
    throw new Error('Cannot empty isbn.');
  }

  const affectedRows = await sequelize.transaction(async (t) => {
    return Book.destroy({
      where: {
        isbn: isbn
      }
    }, { transaction: t });
  });

  return {success: success, affected_rows: affectedRows.length};
}

exports.modules = {
  createBook,
  getBookByIsbn,
  getBookByName,
  getBookByAuthor,
  updateBook,
  deleteBook
}
