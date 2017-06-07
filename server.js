/* Scrape and Display (18.3.8)
 * (If you can do this, you should be set for your hw)
 * ================================================== */

// STUDENTS:
// Please complete the routes with TODOs inside.
// Your specific instructions lie there

// Good luck!

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/week18hw");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) 
{
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() 
{
  console.log("Mongoose connection successful.");
});


// Routes
// ======

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) 
{
  // First, we grab the body of the html with request
  request("http://www.reddit.com/r/programmerhumor", function(error, response, html) 
  {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    var result = [];

    // grab every paragraph with class of title, then save the elements
    $("p.title").each(function(i, element) 
    {

    // Save the text of the element (this) in a "title" variable
    var title = $(this).text();

    // In the currently selected element, look at its child elements (i.e., its a-tags),
    // then save the values for any "href" attributes that the child elements may have
    var link = $(element).children().attr("href");

    // Save these results in an object that we'll push into the result array we defined earlier
    result.push(
      {
      title: title,
      link: link
      });
    });
  // Tell the browser that we finished scraping the text
  res.json(result);
  });
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) 
{
  Article.find({}, function(err, doc)
  {
    if(err)
    {
      console.log(err);
      res.status(500).send(err);
    }
    else
    {
      res.json(doc);
    }
  });
});

app.post("/articles", function(req, res)
{
  console.log("request body: "+ JSON.stringify(req.body));
  var newArticle = new Article(req.body);
  console.log("new Article: " + JSON.stringify(newArticle, null, 2));
  Article.create(newArticle, function(err, doc)
  {
    if(err)
    {
      console.log(err);
      res.status(500).send(err);
    }
    else
    {
      console.log("returned doc = " + doc);
      res.json(doc);
    }
  })
})

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) 
{
  //finds article by ID, then populate it with notes. 
  Article.findOne({"_id": req.params.id}).populate("note").exec(function(err, doc)
  {
    if(err)
    {
      console.log(err);
      res.status(500).send(err);
    }
    else
    {
      console.log("returned doc = " + doc);
      res.json(doc);
    }
  })
});

app.get("/articles/delete", function (req, res)
{
  db.Article.remove({});
  db.Note.remove({});
  res.send("Collections deleted");
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) 
{
  console.log("new article: " + JSON.stringify(req.body, null, 2));
  var note = new Note(req.body);
  console.log("article object: " + JSON.stringify(note));
  note.save(function(error, doc) 
  {
  // Log any errors
    if (error) 
    {
      console.log(error);
    }
  // Or log the doc
    else 
    {
      Article.findOneAndUpdate({"_id": req.params.id}, {"note": doc._id})
      .exec(function(err, doc)
      {
        if(error)
        {
          console.log(error);
        }
        else
        {
          res.json(doc);
        }
      })
    }
  });
});


// Listen on port 3000
app.listen(3000, function() 
{
  console.log("App running on port 3000!");
});
