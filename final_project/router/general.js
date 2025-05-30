const express = require('express');
let books = require("./booksdb.js");
const isValid = require("./auth_users.js").isValid;
const users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  if(username && password){
    if(isValid(username)){
        res.send("User already exists! Go ahead and login.");
    }else{
        users.push({"username":username,"password":password});
        res.send("The user "+ users[users.length>0?(users.length-1):0].username +" has been added as user #"+users.length);
    }
  }else{
    res.send("Appropriate username or password was not provided.");
  }
});



// Get the book list available in the shop
public_users.get('/',function (req, res) {
    
    let myPromise = new Promise((resolve,reject) => {
        setTimeout(() => {
            if(books){
                
                resolve(res.send(JSON.stringify(books,null,4)));
            }else{
                reject(new Error("Failed to send data"));
            }
          
        },2000)});
   myPromise.then((result) => {
        console.log("Status of request:"+result);
    }).catch((error) => {
        res.send("Error: Coud not read in the books database");
    });
    
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if(isbn){
        let myPromise = new Promise((resolve,reject) => {
            setTimeout(() => {
                if(books[isbn]){
                    
                    resolve(res.send(books[isbn]));
                }else{
                    reject(new Error("Error: Could not find book with that isbn"));
                }
            },2000)});
       myPromise.then((result) => {
            console.log("Status of call: " + result);
        }).catch((err)=>{
            res.send("Error: Coud not find requested book");
        });
    }else{
        res.send("ISBN number needed to complete this search.");
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let author = req.params.author;
    if(author){
        let myPromise = new Promise((resolve,reject) => {
            setTimeout(() => {
                let keysArray = Object.keys(books);
                let filteredBookKeys = keysArray.filter((key)=>books[key].author==author);
                if(filteredBookKeys.length>0){
                    let filteredBooks = [];
                    filteredBookKeys.forEach((key)=>{
                        filteredBooks.push(books[key]);
                    })
                    resolve(res.send("Here are the books written by "+author+":"+JSON.stringify(filteredBooks)));
                }else{
                    reject(new Error("Error:No books were found by that author"));
                }
            },2000)});
       myPromise.then((result) => {
            console.log("Status of call: " + result);
        }).catch((error)=>{
            res.send("Couldn't find books for requested author.");
        });
    }else{
        res.send("Author names are needed to complete an author search.");
    }
});
    

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let title = req.params.title;
    if(title){
        let myPromise = new Promise((resolve,reject) => {
            setTimeout(() => {
                let keysArray = Object.keys(books);
                let filteredBookKeys = keysArray.filter((key)=>books[key].title==title);
                //check if there was a match detected by filter
                if(filteredBookKeys.length>0){
                    let filteredBooks = [];
                    filteredBookKeys.forEach((key)=>{
                        filteredBooks.push(books[key]);
                    })
                    resolve(res.send("Here are the books with the title "+title+":"+JSON.stringify(filteredBooks)));
                }else{
                    reject(new Error("Error:No books were found by that title"));
                }
            },2000)});
        myPromise.then((result) => {
            console.log("Status of call: " + result);
        }).catch((error)=>{
            res.send("Couldn't find books for requested title.");
        });
    }else{
        res.send("Titles are needed to complete a title search.");
      }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if(isbn){
    if(books[isbn]){
        const reviewKeys = Object.keys(books[isbn].reviews);
        if(reviewKeys.length>0){
            res.send(books[isbn].reviews);
            
        }else{
            res.send("That book has no reviews yet. Sign in and be the first!");
        }
    }else{
        res.send("Hmm..We could not find reviews for that book. Make sure the ISBN number is correct.");
    }
  }else{
    res.send("ISBN number needed to complete reviews search.");
  }
});

module.exports.general = public_users;
