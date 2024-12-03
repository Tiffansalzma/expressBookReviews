const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  //Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  })
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0){
    return true;
  }else{
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });

  if (validusers.length > 0){
    return true;
  }else{
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password){
    return res.status(404).json({message: "Error logging in"})
  }

  if (authenticatedUser(username, password)){
    let accessToken = jwt.sign({
      data: password
    },'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).json({message: "User succesfully logged in"});
  }else{
    return res.status(208).json({message: "Invalid login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]){
    res.send("Book not found");
  }

  if (!username){
    res.send("User not logged in");
  }

  const bookReviews = books[isbn].reviews;
  //if username already give review, update the review
  if (bookReviews[username]){
    bookReviews[username] = review;
    res.send("Review updated successfully");
  }

  //if there is no username in the reviews, add new review
  bookReviews[username] = review;
  res.send("Review added succesfully");

});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]){
    res.send("Book not found");
  }

  if (!username){
    res.send("User not logged in");
  }

  const bookReviews = books[isbn].reviews;
  if (bookReviews && bookReviews[username]){
    delete bookReviews[username];
    res.send("Delete review succesfully");
  }else{
    res.send("Cannot find review");
  }
  

})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
