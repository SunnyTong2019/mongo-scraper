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


    app.get("/articles", function (req, res) {
        db.Article.find({})
            .then(function (dbArticles) {
                res.json(dbArticles);
            })
            .catch(function (err) {
                res.json(err);
            });
    });


    app.delete("/articles", function (req, res) {
        db.Article.deleteMany({}, function (err) {
            if (err) throw err;
            res.send("Clear Complete");
        });
    });


    app.post("/save/:id", function (req, res) {
        db.Article.findOne({ _id: req.params.id })
            .then(function (dbArticle) {

                db.SavedArticle.findOne({ title: dbArticle.title })
                    .then(function (dbSavedArticle) {

                        if (dbSavedArticle) {
                            res.send("Article already saved")
                        } else {
                            var newArticle = {};
                            newArticle.title = dbArticle.title;
                            newArticle.link = dbArticle.link;
                            newArticle.summary = dbArticle.summary;

                            db.SavedArticle.create(newArticle)
                                .then(function () {
                                    res.send("Article saved");
                                })
                                .catch(function (err) {
                                    res.send(err);
                                });
                        }
                    }).catch(function (err) {
                        res.send(err);
                    });
            })
            .catch(function (err) {
                res.send(err);
            });
    });


    app.get("/savedArticles", function (req, res) {
        db.SavedArticle.find({})
            .then(function (dbSavedArticles) {
                res.json(dbSavedArticles);
            })
            .catch(function (err) {
                res.json(err);
            });
    });


    app.delete("/savedArticles", function (req, res) {
        db.SavedArticle.deleteMany({}, function (err) {
            if (err) throw err;
            res.send("Clear Complete");
        });
    });


    app.delete("/savedArticles/:id", function (req, res) {
        db.SavedArticle.deleteOne({ _id: req.params.id }, function (err) {
            if (err) throw err;
            res.send("Delete Complete");
        });
    });


    app.post("/savedArticles/:id", function (req, res) {
        console.log(req.body);

        db.Note.create(req.body)
            .then(function (dbNote) {
                return db.SavedArticle.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
            })
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            });
    });


    app.get("/savedArticles/:id", function (req, res) {
        db.SavedArticle.findOne({ _id: req.params.id })
            .populate("notes")
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            });
    });


    app.delete("/notes/:id", function (req, res) {
        db.Note.deleteOne({ _id: req.params.id }, function (err) {
            if (err) throw err;
            res.send("Delete Note Complete");
        });
    });
};