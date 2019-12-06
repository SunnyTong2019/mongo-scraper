var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");

module.exports = function (app) {
    
    // route to scrape articles from NPR website and save/add each article to Article collection
    app.get("/scrape", function (req, res) {
        db.Article.deleteMany({}, function (err) { // remove all old articles 
            if (err) throw err;

            axios.get("https://www.npr.org").then(function (response) {
                var $ = cheerio.load(response.data);

                $(".story-text").each(function (i, element) {
                    var result = {};

                    result.title = $(this).children("a").children("h3.title").text();
                    result.link = $(this).children("a").attr("href");
                    result.summary = $(this).children("a").children("p.teaser").text();;

                    db.Article.create(result) // then add new ones
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

    // route to get all scraped articles from Article collection
    app.get("/articles", function (req, res) {
        db.Article.find({})
            .then(function (dbArticles) {
                res.json(dbArticles);
            })
            .catch(function (err) {
                res.json(err);
            });
    });

    // route to clear/delete all scraped articles in Article collection
    app.delete("/articles", function (req, res) {
        db.Article.deleteMany({}, function (err) {
            if (err) throw err;
            res.send("Clear Complete");
        });
    });

    // route to save article  
    app.post("/save/:id", function (req, res) {
        db.Article.findOne({ _id: req.params.id }) // grab the article (that needs to be saved) from Article collection
            .then(function (dbArticle) {

                db.SavedArticle.findOne({ title: dbArticle.title }) // check if the article already exists in SavedArticle collection
                    .then(function (dbSavedArticle) {

                        if (dbSavedArticle) { // if found, return "already saved"
                            res.send("Article already saved")
                        } else { // if not found, then add/insert to SavedArticle collection
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

    // route to get all saved articles from SavedArticle collection
    app.get("/savedArticles", function (req, res) {
        db.SavedArticle.find({})
            .then(function (dbSavedArticles) {
                res.json(dbSavedArticles);
            })
            .catch(function (err) {
                res.json(err);
            });
    });

    // route to clear/delete all saved articles in SavedArticle collection
    app.delete("/savedArticles", function (req, res) {
        db.SavedArticle.deleteMany({}, function (err) {
            if (err) throw err;
            res.send("Clear Complete");
        });
    });

    // route to clear/delete ONE saved article in SavedArticle collection
    app.delete("/savedArticles/:id", function (req, res) {
        db.SavedArticle.deleteOne({ _id: req.params.id }, function (err) {
            if (err) throw err;
            res.send("Delete Complete");
        });
    });

    // route to add a new note to a saved article
    app.post("/savedArticles/:id", function (req, res) {
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

    // route to get a saved article populated with all its notes
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

    // route to delete a note for a saved article
    app.delete("/notes/:id", function (req, res) {
        db.Note.deleteOne({ _id: req.params.id }, function (err) {
            if (err) throw err;
            res.send("Delete Note Complete");
        });
    });

    // route to update a note for a saved article
    app.put("/notes/:id", function (req, res) {
        db.Note.updateOne({ _id: req.params.id }, {body: req.body.note}, function (err) {
            if (err) throw err;
            res.send("Update Note Complete");
        });
    });
};