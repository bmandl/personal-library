/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var mongoose = require("mongoose");
var objectId = mongoose.Types.ObjectId;

var bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  commentcount: { type: Number, default: 0 },
  comments: [String]
});

var Book = mongoose.model("Books", bookSchema);

function checkRequired(book, requiredFields) {
  let missing = [];

  requiredFields.forEach(element => {
    if (!book.hasOwnProperty(element) || book[element] === "")
      missing.push(element);
  });

  if (missing.length) {
    return "Missing required fields: " + missing.join(", ");
  }
  return false;
}

function checkId(_id) {
  let id = new objectId(_id);
  if (!objectId.isValid(_id) || !_id) {
    return "_id error";
  }
  return false;
}

module.exports = function(app) {
  app
    .route("/api/books")
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({}, "_id title commentcount", (err, books) => {
        if (err) return res.status(500).send(err);
        res.json(books);
      });
    })

    .post(function(req, res) {
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      let requiredFields = ["title"];
      let error = checkRequired(req.body, requiredFields);
      if (error) {
        console.log(error);
        return res.status(400).send(error);
      }

      let newBook = Book(req.body);
      newBook.save((err, book) => {
        if (err) res.status(500).send("server error");
        res.json(book);
      });
    })

    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, (err, books) => {
        if (err) return res.status(500).send("sever error");
        res.send("complete delete successful");
      });
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      let error = checkId(bookid);
      if (error) return res.status(400).send(error);

      Book.findById(objectId(bookid), "_id title comments", (err, book) => {
        if (err) return res.status(500).send("server error");
        if (!book) return res.status(400).send("no book exists");
        res.json(book);
      });
    })

    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      let error = checkId(bookid);
      if (error) return res.status(400).send(error);

      Book.findByIdAndUpdate(objectId(bookid), { $push: { comments: comment } })
        .select("_id title comments")
        .exec((err, book) => {
          if (err) return res.status(500).send(err);
          if (!book) return res.status(400).send("no book exists");
          res.json(book);
        });
    })

    .delete(function(req, res) {
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      let error = checkId(bookid);
      if (error) return res.status(400).send(error);

      Book.findByIdAndDelete(objectId(bookid), (err, book) => {
        if (err) return res.status(500).send(err);
        if (!book) return res.status(400).send("no book exists");
        res.send("delete successful");
      });
    });
};
