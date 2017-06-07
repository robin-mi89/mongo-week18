// Grab the articles as a json
getSavedArticles();

function getSavedArticles()
{
  $.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      populateArticle(data[i])
    }
  });
}

//general function to add an article to the saved-articles div
function populateArticle(value)
{
  let container = $("<div class='article-div'></div>");
  let btnDelete = $("<button class='btn btn-danger del-article' style='margin-left: 15px'>Delete Article</button>");
  let btnNote = $("<button class='btn btn-info add-note'>Add Note</button>")
  btnNote.attr("data-id", value._id);
  btnDelete.attr("data-id", value._id);
  container.append("<p data-id='" + value._id + "'>" + value.title + "<br />");
  container.append("<a href=" + value.link + ">"+value.link+"</a><br />");
  container.append(btnNote);
  container.append(btnDelete);
  container.append("<hr/>");
  $("#saved-articles").append(container);
}

//scrape button click. Scrapes programmerhumor and creates a list of articles that populates page. 
$("#btnScrape").on("click", function()
{
  console.log("scraping")
  $.getJSON("/scrape", function(data)
  {
    console.log("got back data" + JSON.stringify(data));
    data.forEach(function(value)
    {
      let submitBtn = $("<button class='btn btn-info save-article'>Save Article</button>");
      submitBtn.attr("data-title", value.title);
      submitBtn.attr("data-link", value.link);
      $("#articles").append("<p>"+value.title+"<br />" + "</p>");
      $("#articles").append("<a href=" + value.link + ">"+value.link+"</a><br />")
      $("#articles").append(submitBtn);
      $("#articles").append("<hr/>");
    });
  });
});

//clicked on save article, push article to db. 
$(document).on("click", "button.save-article", function(event) {
  event.preventDefault();
  var article = {title: $(this).attr("data-title"), link: $(this).attr("data-link")};
  $.post("/articles", article, function(data)
  {
    populateArticle(data);
  })
});

//When someone clicks on delete button for an article
$(document).on("click", "button.del-article", function(event)
{
  console.log("clicked on delete for id: "+ $(this).attr("data-id"));
  event.preventDefault();
  $.get("/articles/delete/"+$(this).attr("data-id"), function(data)
  {
    $("#saved-articles").empty();
    getSavedArticles();
    console.log(data);
  });
})

// Whenever someone clicks the add-note button
$(document).on("click", "button.add-note", function(event) {
  event.preventDefault();
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

