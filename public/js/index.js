// get all the scraped articles from database Article collection
$.getJSON("/articles", function (data) {
  if (data.length > 0) { // if database has articles
    $("#no-articles").css("display", "none"); // don't display #no-articles div

    for (var i = 0; i < data.length; i++) { // build a card to display each article
      var div1 = $("<div>").addClass("row article");
      var div2 = $("<div>").addClass("col s12");
      var div3 = $("<div>").addClass("card teal");
      var div31 = $("<div>").addClass("card-content white-text");
      var articleLink = $("<a>").attr("href", data[i].link);
      var span = $("<span>").addClass("card-title white-text").text(data[i].title);
      articleLink.append(span);
      var p = $("<p>").text(data[i].summary);
      div31.append(articleLink, p);
      var div32 = $("<div>").addClass("card-action");
      var saveArticleBtn = $("<a>").addClass("save-article-btn red waves-effect waves-light btn").attr("data-articleid", data[i]._id).text("Save Article");
      div32.append(saveArticleBtn);
      div3.append(div31, div32);
      div2.append(div3);
      div1.append(div2);
      $("#articles").append(div1);
    }
  } else { // if no article in database, display #no-articles div
    $("#no-articles").css("display", "block");
  }
});


$("#scrape-btn").click(function () {
  $.get("/scrape", function (data) {
    location.reload();
  })
})


$("#clear-btn").click(function () {
  $.ajax({
    url: "/articles",
    type: "DELETE",
    success: function (data) {
      location.reload();
    }
  });
})


// when click Save Article, grab that article from Article collection then add/insert to SavedArticle collection
$(document).on("click", ".save-article-btn", function () {
  var articleID = $(this).attr("data-articleid");

  $.post("/save/" + articleID, function (data) {
    if (data === "Article already saved") {

      show_modal("modal-already-saved");
      setTimeout(function () { hide_modal("modal-already-saved"); }, 3000);

    } else if (data == "Article saved") {

      show_modal("modal-saved");
      setTimeout(function () { hide_modal("modal-saved"); }, 3000);

    }
  })
})


function show_modal(modalID) {
  $('#' + modalID).modal();
  $('#' + modalID).modal('open');
}


function hide_modal(modalID) {
  $('#' + modalID).modal('close');
}