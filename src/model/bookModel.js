const sequelize = require('../db/sequelize');
const { Book } = require('../db/init');
const { Op } = require('sequelize');

async function createBook(isbn, title, author, publisher) {
  try {
    const newBook = await sequelize.transaction(async (t) => {
      return Book.create({
        isbn: isbn,
        title: title,
        author: author,
        publisher: publisher
      }, { transaction: t });
    });
    const obj = newBook.toJSON();
    return obj;
  } catch (err) {
    console.log(err);
    throw err;
  }
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
  const obj = book.toJSON();
  return obj;
}

async function getBookByName(name) {
  const [book] = await Book.findAll({
    where: {
      name: { 
        [Op.like]: `%${name}%` 
      }
    }
  });
  if(!book){
    throw new Error('Book not found.');
  }
  const obj = book.toJSON();
  return obj;
}

async function updateBook(isbn, changedIsbn, changedName, changedAuthor, changedPublisher) {
  const [affectedRows] = await sequelize.transaction(async (t) => {
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
  const deletedRows = await sequelize.transaction(async (t) => {
    return Book.destroy({
      where: {
        isbn: isbn
      },
      transaction: t
    });
  });
  return deletedRows;
}

module.exports = {
  createBook,
  getBookByIsbn,
  getBookByName,
  updateBook,
  deleteBook
}
