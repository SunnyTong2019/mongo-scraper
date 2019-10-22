var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");

module.exports = function (app) {
    app.get("/scrape", function (req, res) {

        db.Article.deleteMany({}, function (err) {
            if (err) throw err;

            axios.get("https://www.npr.org").then(function (response) {

                var $ = cheerio.load(response.data);

                $(".story-text").each(function (i, element) {
                    var result = {};

                    result.title = $(this).children("a").children("h3.title").text();
                    result.link = $(this).children("a").attr("href");
                    result.summary = $(this).children("a").children("p.teaser").text();;

                    db.Article.create(result)
                        .then(function (dbArticle) {
                            console.log(dbArticle);
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                });

                res.send("Scrape Complete");
            })
        });
    });

    app.get("/articles", function(req, res) {
        db.Article.find({})
          .then(function(dbArticles) {
            res.json(dbArticles);
          })
          .catch(function(err) {
            res.json(err);
          });
      });
};