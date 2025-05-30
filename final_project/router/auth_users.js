const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const users = [];

const isValid = (username)=>{ 
//check if the username is valid
    let validNames = users.filter((user)=>(
        username===user.username
    ));
    if(validNames.length>0){
        return true;
    }else{
        return false;
    }
}

const authenticatedUser = (username, password) => {
    // Return true if any valid user is found, otherwise false
    let validUsers = users.filter((user) => (
        isValid(username) && (user.password === password)
    ));    
    if (validUsers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    if(authenticatedUser(username,password)){
        //JWT token
         let accessToken = jwt.sign({
             data: password
         }, 'access', { expiresIn: 60 * 60 });
 
         // Store token and username in session
         req.session.authorization = {
             accessToken, username
         }
         return res.status(200).send(req.session.authorization.username +" successfully logged in- token: "+req.session.authorization.accessToken );
     }else{
         res.send("User has not been authenticated.");
     }
   }else{
    return res.status(404).json({ message: "Error logging in" });
   }
});

//add a book review
regd_users.post("/auth/review/:isbn", (req, res) => {
    
    let user = req.session.authorization.username;
    if(user){
        const review = req.query.review;
        const isbn = req.params.isbn;
                if(isbn){
                    if(books[isbn]){
                        if(review){
                            
                            let reviewKeys = Object.keys(books[isbn].reviews);
                            if(reviewKeys){
                                let nextIndex = reviewKeys.length+1;
                                books[isbn].reviews[reviewKeys.length]={
                                    "username":user,
                                    "review": review,
                                };
                                
                                res.send("Your review has been accepted. Thanks! (See below)" + JSON.stringify(books[isbn].reviews));
                            }else{
                                res.send("Couldn't find review object for this book -Sorry");
                            }
                            
                        }else{
                            res.send("No review was submitted.");
                        }
                    }else{
                        res.send("Hmm..We could not find that book. Make sure the ISBN number is correct.");
                    }
                }else{
                    res.send("ISBN number needed to complete reviews search.");
                }
    }else{
        res.send("Couldn't validate current user session. Log in again. ");
    }
});

//modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
     
    let user = req.session.authorization.username;
    if(user){
        const review = req.query.review; 
        const isbn = req.params.isbn;
        if(isbn){
            if(books[isbn]){
                let reviewKeys = Object.keys(books[isbn].reviews);
                if(reviewKeys.length>0){
                    let filteredKey = reviewKeys.filter((reviewKey)=>(
                            books[isbn].reviews[reviewKey].username==user
                        )
                    );
                    if(filteredKey){
                                               
                        books[isbn].reviews[filteredKey].review = review;
                        res.send("Found your old review! The new one has been submitted. Thanks! (See below)"+ JSON.stringify(books[isbn].reviews));
                    }else{
                        res.send("You haven't made any reviews to update on this book yet. Add one today!");
                    }
                }else{
                    res.send("That book has no reviews yet. Be the first!");
                }
            }else{
                res.send("Hmm..We could not find reviews for that book. Make sure the ISBN number is correct.");
            }
        }else{
            res.send("ISBN number needed to complete reviews search.");
        }
    }else{
        res.send("Couldn't validate current user session. Log in again. ");
    }
   
});

//delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
        
    let user = req.session.authorization.username;
    if(user){
        const isbn = req.params.isbn;
        if(isbn){
            if(books[isbn]){
                let reviewKeys = Object.keys(books[isbn].reviews);
                if(reviewKeys.length>0){
                    //find if there is a review the current user made
                    let filteredKey = reviewKeys.filter((reviewKey)=>(
                            books[isbn].reviews[reviewKey].username==user
                        )
                    )
                    if(filteredKey.length>0){
                        delete books[isbn].reviews[filteredKey[0]];
                        res.send("Deleted your review for "+books[isbn].title+" by "+books[isbn].author+": "+ JSON.stringify(books[isbn].reviews));
                    }else{
                        res.send("You haven't made any reviews to delete on this book.");
                    }
                }else{
                    res.send("That book has no reviews yet. Be the first!");
                }
            }else{
                res.send("Hmm..We could not find reviews for that book. Make sure the ISBN number is correct.");
            }
        }else{
            res.send("ISBN number needed to complete reviews search.");
        }
    }else{
        res.send("Couldn't validate current user session. Log in again. ");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
