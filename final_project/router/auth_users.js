const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { 
    // Check if username exists
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    // Check if username and password match
    return users.some(user => 
        user.username === username && 
        user.password === password
    );
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    try {
        const accessToken = jwt.sign(
            { data: password },
            'access',
            { expiresIn: 60 * 60 }
        );

        req.session.authorization = {
            accessToken,
            username
        };

        return res.status(200).json({
            message: "User successfully logged in",
            token: accessToken,
            username: username
        });
    } catch (error) {
        console.error("JWT Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Add a book review
regd_users.post("/auth/review/:isbn", (req, res) => {
    if (!req.session.authorization) {
        return res.status(403).json({ message: "Not logged in" });
    }

    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!isbn) {
        return res.status(400).json({ message: "ISBN required" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review text required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    try {
        const reviewId = Object.keys(books[isbn].reviews).length + 1;
        books[isbn].reviews[reviewId] = {
            username,
            review
        };

        return res.status(201).json({
            message: "Review added successfully",
            review: books[isbn].reviews[reviewId]
        });
    } catch (error) {
        console.error("Review Error:", error);
        return res.status(500).json({ message: "Failed to add review" });
    }
});

// Modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    if (!req.session.authorization) {
        return res.status(403).json({ message: "Not logged in" });
    }

    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!isbn) {
        return res.status(400).json({ message: "ISBN required" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review text required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    try {
        const userReview = Object.entries(books[isbn].reviews)
            .find(([_, r]) => r.username === username);

        if (!userReview) {
            return res.status(404).json({ message: "No review found for this user" });
        }

        const [reviewId] = userReview;
        books[isbn].reviews[reviewId].review = review;

        return res.status(200).json({
            message: "Review updated successfully",
            review: books[isbn].reviews[reviewId]
        });
    } catch (error) {
        console.error("Review Error:", error);
        return res.status(500).json({ message: "Failed to update review" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    if (!req.session.authorization) {
        return res.status(403).json({ message: "Not logged in" });
    }

    const username = req.session.authorization.username;
    const isbn = req.params.isbn;

    if (!isbn) {
        return res.status(400).json({ message: "ISBN required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    try {
        const userReview = Object.entries(books[isbn].reviews)
            .find(([_, r]) => r.username === username);

        if (!userReview) {
            return res.status(404).json({ message: "No review found for this user" });
        }

        const [reviewId] = userReview;
        delete books[isbn].reviews[reviewId];

        return res.status(200).json({
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error("Review Error:", error);
        return res.status(500).json({ message: "Failed to delete review" });
    }
});

module.exports = {
    authenticated: regd_users,
    isValid,
    users
};