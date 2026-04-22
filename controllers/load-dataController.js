const { name } = require("ejs");
const mealUtil = require("../modules/mealkit-util.js");
const mealKitModel = require("../modules/mealKitModel.js");

const express = require("express");
const router = express.Router();

router.get("/mealkits", (req, res) => {
  if (req.session && req.session.user && req.session.role === "dataClerk") {
    mealKitModel.countDocuments().then((count) => {
      if (count === 0) {
        mealKitModel
          .insertMany(mealUtil.getAllMealKits())
          .then(() => {
            res.status(200).render("error", {
              title: "Success",
              status: 200,
              message: "Success, data was loaded into database!",
              error: {},
            });
          })
          .catch((err) => {
            res.status(500).render("error", {
              title: "Error",
              message: "Failed to load data into database",
              error: err,
            });
          });
      } else {
        res.status(409).render("error", {
          title: "Data already loaded",
          status: 409,
          message: "Meal kit data has already been loaded into database.",
          error: {},
        });
      }
    });
  } else {
    res.status(401).render("error", {
      title: "Error",
      status: 401,
      message: "You are not authorized to view this page",
      error: {},
    });
  }
});

module.exports = router;
