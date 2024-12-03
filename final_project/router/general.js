const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password){
    // Check if the user does not already exist
    if (!isValid(username)){
      // Add the new user to the users array
      users.push({"username":username, "password":password});
      return res.status(200).json({message: "User succesfully registered. Now you can login"});
    }else{
      return res.status(404).json({message: "User already exists!"});
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve(books), 600);
  });
  promise.then((result) => {
    return res.status(200).json({ books: result });
  })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const ISBN = req.params.isbn;
  const promise = new Promise ((resolve, reject) => {
    setTimeout(() => resolve (books[ISBN]), 600);
  })

  const book = await promise;

  if (book){
    res.send(book);
  }else{
    res.send("Book not found");
  };
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const filteredBooks = Object.values(books).filter((book) => book.author.toLowerCase() === author.toLowerCase());
      resolve(filteredBooks);
    }, 600);
  })
  
  const filteredBooks = await promise;
  
  if (filteredBooks.length > 0){
    res.send(filteredBooks);
  }else{
    res.send("No books found by this author");
  }
  
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const filteredBook = Object.values(books).filter((book) => book.title.toLocaleLowerCase() === title.toLocaleLowerCase());
      resolve(filteredBook);
    }, 600);
  })
  
  const filteredBook = await promise;

  if (filteredBook.length > 0){
    res.send(filteredBook);
  }else{
    res.send("No books found by this title");
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const ISBN = req.params.isbn;
  const book = books[ISBN];

  if (book){
    res.send(book.reviews);
  }else{
    res.send("Book not found");
  }
});

module.exports.general = public_users;
