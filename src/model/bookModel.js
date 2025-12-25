const sequelize = require('../db/sequelize');
const { Book } = require('../db/init');
const { Op } = require('sequelize');

async function createBook(isbn, name, author, publisher) {
  const newBook = await sequelize.transaction(async (t) => {
    return await Book.create({
      isbn: isbn,
      name: name,
      author: author,
      publisher: publisher
    }, { transaction: t });
  });
  return newBook;
}

async function getBookByIsbn(isbn) {
  const book = await Book.findOne({
    where: {
      isbn: isbn
    }
  });
  if (!book) {
    throw new Error('Book not found.');
  }
}

async function getBookByName(name) {
  const [book] = await Book.findAll({
    where: {
      [Op.like]: [`%${name}%`]
    }
  });
  if(!book){
    throw new Error('Book not found.');
  }
}

async function updateBook(isbn, changedIsbn, changedName, changedAuthor, changedPublisher) {
  const [affectedRows] = await sequelize.transaction((t) => {
    return Book.update({
      isbn: changedIsbn,
      name: changedName,
      author: changedAuthor,
      publisher: changedPublisher
    }, {
      where: {
        isbn: isbn
      },
      transaction: t
    });
  });

  return affectedRows;
}

async function deleteBook(isbn) {
  const deletedRows = await sequelize.transaction((t) => {
    return Book.destroy({
      where: {
        isbn: isbn
      },
      transaction: t
    });
  });
}

module.exports = {
  createBook,
  getBookByIsbn,
  getBookByName,
  updateBook,
  deleteBook
}
