const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Favorites = require("../models/favorite");
const mongoose = require("mongoose");
const user = require("../models/user");
const { remove } = require("../models/user");
const Dishes = require("../models/dishes");
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then((favorites) => {
        if (favorites) {
          favorite = favorites.filter(
            (fav) => fav.user._id.toString() === req.user.id.toString()
          )[0];
          if (!favorite) {
            var err = new Error("You have no favorite dishes!");
            err.status = 404;
            return next(err);
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        } else {
          var err = new Error("There are no favorites");
          err.status = 404;
          next(err);
        }
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then((favorites) => {
        var user;
        if (favorites)
          user = favorites.filter(
            (fav) => fav.user._id.toString() === req.user.id.toString()
          )[0];
        if (!user) user = new Favorites({ user: req.user.id });
        for (let i of req.body) {
          if (
            user.dishes.find((id) => {
              if (id._id) return id._id.toString() === i._id.toString();
            })
          )
            continue;
          user.dishes.push(i._id);
        }
        user
          .save()
          .then((userFav) => {
            Favorites.findById(userFav._id)
              .populate("user")
              .populate("dishes")
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then((favorites) => {
        var favRemove;
        if (favorites)
          favRemove = favorites.filter(
            (fav) => fav.user._id.toString() === req.user.id.toString()
          )[0];
        if (favRemove) {
          favRemove
            .remove({})
            .then((result) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(result);
            })
            .catch((err) => next(err));
        } else {
          var err = new Error("You do not have any favourites");
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorites) => {
          if (!favorites) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            return res.json({ exists: false, favorites: favorites });
          } else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: false, favorites: favorites });
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: true, favorites: favorites });
            }
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then((favorites) => {
        var user;
        if (favorites.length != 0)
          user = favorites.filter(
            (fav) => fav.user._id.toString() === req.user.id.toString()
          )[0];
        if (!user) user = new Favorites({ user: req.user.id });
        if (
          !user.dishes.find((id) => {
            if (id._id)
              return id._id.toString() === req.params.dishId.toString();
          })
        )
          user.dishes.push(req.params.dishId);
        user
          .save()
          .then((userFavs) => {
            Favorites.findById(userFavs._id)
              .populate("user")
              .populate("dishes")
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(userFavs);
              });
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not supported on /favourites/:dishId");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate("user")
      .populate("dishes")
      .then(
        (favorites) => {
          var user;
          if (favorites)
            user = favorites.filter(
              (fav) => fav.user._id.toString() === req.user.id.toString()
            )[0];

          if (user) {
            user.dishes = user.dishes.filter(
              (dishid) => dishid._id.toString() !== req.params.dishId
            );
            user.save().then(
              (result) => {
                Favorites.findById(result._id)
                  .populate("user")
                  .populate("dishes")
                  .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
              },
              (err) => next(err)
            );
          } else {
            var err = new Error("You do not have any favourites");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
