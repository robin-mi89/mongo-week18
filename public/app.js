// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#saved-articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />");
    $("#saved-articles").append("<a href=" + data[i].link + ">"+data[i].link+"</a><br />");
    $("#articles").append("<hr/>");
  }
});

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
    console.log("posted article");
    console.log(JSON.stringify(data, null, 2));
  })
});

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
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

$("#btnDelete").on("click", function(e)
{
  console.log("clicked delete");
  e.preventDefault();
  $.get("/articles/delete", function(err, value)
  {
    if(err)
    console.log(err);
    else
    {
      console.log(value);
      $("#saved-articles").clear();
    }
  })
});
