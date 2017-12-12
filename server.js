var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var mongojs = require("mongojs");

// Schemas
var Article = require('./models/article.js');
var Comment = require('./models/commentModel.js');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

var PORT = 3000;

// Initialize Express
var app = express();


request("http://www.vox.com", function(error, response, html, res){
    var $ = cheerio.load(html);

    $("h2.c-entry-box--compact__title").each(function(i, element) {
      var result = {};
      var link = $(element).children().attr("href");
      var title = $(element).children().text();

      var entry = new Article (result);

    });
  console.log("Articles Retrieved");
});

app.get('/articles', function(req, res){
  Article.find({}, function(err, doc){
    if (err){
      console.log(err);
    } else {
      res.json(doc);
    }
  });
});

app.get('/articles/:id', function(req, res){
  Article.findOne({'_id': req.params.id})
  .populate('comment')
  .exec(function(err, doc){
    if (err){
      console.log(err);
    } else {
      res.json(doc);
    }
  });
});

app.post('/articles/:id', function(req, res){
  var newComment = new Comment(req.body);

  newComment.save(function(err, doc){
    if(err){
      console.log(err);
    } else {
      Article.findOneAndUpdate({'_id': req.params.id}, {'comment':doc._id})
      .exec(function(err, doc){
        if (err){
          console.log(err);
        } else {
          res.send(doc);
        }
      });

    }
  });
});

// Middleware 
  app.use(logger('dev'));
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(express.static('public')); // (create a public folder and land there)

// Database configuration
// Save the URL of our database as well as the name of our collection
var databaseUrl = "newsdb";
var collections = ["articles"];

// Use mongojs to hook the database to the db variable
var db = mongojs(databaseUrl, collections);

// This makes sure that any errors are logged if mongodb runs into an issue
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Routes
app.get('/', function(req, res) {
  res.send(index.html);
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});