const mealUtil = require("../modules/mealkit-util.js");
const mealKitModel = require("../modules/mealKitModel");
const path = require("path");

const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {

    const dbMealKits = await mealKitModel.find();
    const mealKits = dbMealKits.map((value) => value.toObject());
    const categoryMeals = mealUtil.getMealKitsByCategory(mealKits);

    res.render("mealkits/on-the-menu", {
        title: "Menu",
        categoryMeals
    });
});

router.get('/list', async (req, res) => {
    const dbMealKits = await mealKitModel.find();
    const mealKits = dbMealKits.map((value) => value.toObject());


    if(req.session.role !== "dataClerk" || !req.session.user) {
        return res.status(401).render("error", {
            title: "Error",
            status: 401,
            message: "You are not authorized to view this page",
            error: {}
        });
    }else {

        res.render("mealkits/list", {
            title: "Meal Kits List",
            user: req.session.user,
            mealKits
        });
    }

});

router.get("/add", (req, res) => {
  if (req.session.role !== "dataClerk" || !req.session.user) {
    res.status(401).render("error", {
      title: "Error",
      status: 401,
      message: "You are not authorized to view this page",
      error: {},
    });
  } else {
    res.render("mealkits/add", {
      title: "Add Meal Kit",
      validationMessages: {},
      values: {
        title: "",
        includes: "",
        description: "",
        category: "",
        price: "",
        cookingTime: "",
        servings: "",
        imageUrl: "",
        featured: "",
      },
    });
  }
});

router.post("/add", async (req, res) => {
  console.log(req.body);
  if (req.session.role !== "dataClerk" || !req.session.user) {
    res.status(401).render("error", {
      title: "Error",
      status: 401,
      message: "You are not authorized to view this page",
      error: {},
    });
  } else {
    const {
      title,
      includes,
      description,
      category,
      price,
      cookingTime,
      servings,
      imageUrl,
      featured,
    } = req.body;

    let passedValidation = true;
    let validationMessages = {};

    if (typeof title !== "string") {
      passedValidation = false;
      validationMessages.title = "You must specify a title.";
    } else if (title.trim().length === 0) {
      passedValidation = false;
      validationMessages.title = "Title is required.";
    } else if (title.trim().length < 5) {
      passedValidation = false;
      validationMessages.title = "Title is too short.";
    }

    if (typeof includes !== "string") {
      passedValidation = false;
      validationMessages.includes =
        "You must specify what the meal kit includes.";
    } else if (includes.trim().length === 0) {
      passedValidation = false;
      validationMessages.includes = "Includes is required.";
    }

    if (typeof description !== "string") {
      passedValidation = false;
      validationMessages.description = "You must specify a description.";
    } else if (description.trim().length === 0) {
      passedValidation = false;
      validationMessages.description = "Description is required.";
    }

    if (typeof category !== "string") {
      passedValidation = false;
      validationMessages.category = "You must specify a category.";
    } else if (category.trim().length === 0) {
      passedValidation = false;
      validationMessages.category = "Category is required.";
    }

    if (isNaN(price) || price <= 0) {
      passedValidation = false;
      validationMessages.price = "You must specify a valid price.";
    }

    if (isNaN(cookingTime) || cookingTime <= 0) {
      passedValidation = false;
      validationMessages.cookingTime = "You must specify a valid cooking time.";
    }

    if (isNaN(servings) || servings <= 0) {
      passedValidation = false;
      validationMessages.servings =
        "You must specify a valid number of servings.";
    }

    if (!req.files || !req.files.imageUrl) {
      passedValidation = false;
      validationMessages.imageUrl = "You must upload an image.";
    }

    const existingMealKit = await mealKitModel.findOne({ title });

    if (existingMealKit) {
      passedValidation = false;
      validationMessages.title = "This meal kit already exists.";
    } else {
      const mealKitPic = req.files.imageUrl;
      const allowed = [".jpg", ".jpeg", ".png", ".gif"];
      const ext = path.extname(mealKitPic.name);

      console.log(ext);

      if (!allowed.includes(ext)) {
        passedValidation = false;
        validationMessages.imageUrl = "Only image files are allowed.";
      }
    }

    if (passedValidation) {
      const booleanF = featured === "on" ? true : false;

      const newMealKit = new mealKitModel({
        title,
        includes,
        description,
        category,
        price,
        cookingTime,
        servings,
        imageUrl: " ",
        featured: booleanF,
      });

      newMealKit
        .save()
        .then((mealKit) => {
          const mealKitPic = req.files.imageUrl;
          const mealKitPicName = path.parse(mealKitPic.name);
          const uniqueName = `mealkit-pic-${mealKit._id}${mealKitPicName.ext}`;

          mealKitPic
            .mv(`public/images/${uniqueName}`)
            .then(() => {
              mealKitModel
                .updateOne(
                  { _id: mealKit._id },
                  { imageUrl: `/images/${uniqueName}` },
                )
                .then(() => {
                  res.status(200).render("error", {
                    title: "Success",
                    status: 200,
                    message: "mealkit was loaded into database with the image!",
                    error: {},
                  });
                })
                .catch((err) => {
                  res.status(500).render("error", {
                    title: "Error",
                    status: 500,
                    message:
                      "An error occurred while updating the meal kit with the image URL.",
                    error: err,
                  });
                });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).render("error", {
                title: "Error",
                status: 500,
                message:
                  "An error occurred while uploading the meal kit image.",
                error: err,
              });
            });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).render("error", {
            title: "Error",
            status: 500,
            message: "An error occurred while saving the meal kit.",
            error: err,
          });
        });
    } else {
      res.render("mealkits/add", {
        title: "Add Meal Kit",
        validationMessages,
        values: req.body,
      });
    }
  }
});

router.get("/edit/:id", (req, res) => {
  if (req.session.role !== "dataClerk" || !req.session.user) {
    res.status(401).render("error", {
      title: "Error",
      status: 401,
      message: "You are not authorized to see this page.",
      error: {},
    });
  } else {
    const mealKitId = req.params.id;
    mealKitModel
      .findById(mealKitId)
      .then((mealKit) => {
        if (!mealKit) {
          res.status(404).render("error", {
            title: "Error",
            status: 404,
            message: "Meal kit not found.",
            error: {},
          });
        } else {
          res.render("mealkits/edit", {
            title: "Edit Meal Kit",
            validationMessages: {},
            values: mealKit,
          });
        }
      })
      .catch((err) => {
        res.status(500).render("error", {
          title: "Error",
          status: 500,
          message: "An error occurred while fetching the meal kit.",
          error: err,
        });
      });
  }
});

router.post("/edit/:id", async (req, res) => {
  if (req.session.role !== "dataClerk" || !req.session.user) {
    res.status(401).render("error", {
      title: "Error",
      status: 401,
      message: "You are not authorized to see this page.",
      error: {},
    });
  } else {
    try {
      const mealKitId = req.params.id;
      const mealKit = await mealKitModel.findById(mealKitId);

      if (!mealKit) {
        res.status(404).render("error", {
          title: "Error",
          status: 404,
          message: "Meal kit not found.",
          error: {},
        });
      } else {
        const {
          title,
          includes,
          description,
          category,
          price,
          cookingTime,
          servings,
          featured,
        } = req.body;

        let updatedFields = {};
        let validationMessages = {};
        let passedValidation = true;

        if (typeof title === "string" && title.trim() !== mealKit.title) {
          updatedFields.title = title.trim();
        }

        if (
          typeof includes === "string" &&
          includes.trim() !== mealKit.includes
        ) {
          updatedFields.includes = includes.trim();
        }

        if (
          typeof description === "string" &&
          description.trim() !== mealKit.description
        ) {
          updatedFields.description = description.trim();
        }

        if (
          typeof category === "string" &&
          category.trim() !== mealKit.category
        ) {
          updatedFields.category = category.trim();
        }

        if (!isNaN(price) && price > 0 && price !== mealKit.price) {
          updatedFields.price = price;
        }

        if (
          !isNaN(cookingTime) &&
          cookingTime > 0 &&
          cookingTime !== mealKit.cookingTime
        ) {
          updatedFields.cookingTime = cookingTime;
        }

        if (!isNaN(servings) && servings > 0 && servings !== mealKit.servings) {
          updatedFields.servings = servings;
        }

        const featuredValue = featured === "on";

        if (featuredValue !== mealKit.featured) {
          updatedFields.featured = featuredValue;
        }

        if (req.files && req.files.imageUrl) {
          const mealKitPic = req.files.imageUrl;
          const ext = path.extname(mealKitPic.name);

          console.log(ext + " is the extension of the uploaded file.");

          const allowedExtensions = [".jpg", ".jpeg", ".gif", ".png"];

          if (!allowedExtensions.includes(ext)) {
            passedValidation = false;
            validationMessages.imageUrl = "Only image files are allowed.";
          } else {
            const uniqueName = `mealkit-pic-${mealKitId}${mealKitPicName.ext}`;

            await mealKitPic.mv(`public/images/${uniqueName}`);
            updatedFields.imageUrl = `/images/${uniqueName}`;
          }
        }

        if (passedValidation) {
          await mealKitModel.updateOne(
            { _id: mealKitId },
            { $set: updatedFields },
          );
          res.status(200).render("error", {
            title: "Success",
            status: 200,
            message: "Meal kit updated successfully",
            error: {},
          });
        } else {
          res.render("mealkits/edit", {
            title: "Edit Meal Kit",
            validationMessages,
            values: { ...mealKit.toObject(), ...req.body },
          });
        }
      }
    } catch (err) {
      console.log(err);

      res.status(500).render("error", {
        title: "Error",
        status: 500,
        message: "An error occurred while updating meal kit.",
        error: err,
      });
    }
  }
});

router.get("/delete/:id", async (req, res) => {
  if (req.session.role !== "dataClerk" || !req.session.user) {
    res.status(401).render("error", {
      title: "Error",
      status: 401,
      message: "You are not authorized to see this page.",
      error: {},
    });
  } else {
    const mealKitId = req.params.id;

    try {
      const mealKit = await mealKitModel.findById(mealKitId);
      if (!mealKit) {
        res.status(404).render("error", {
          title: "Error",
          status: 404,
          message: "Meal kit not found.",
          error: {},
        });
      } else {
        res.render("mealkits/delete", {
          title: "Confirm Delete Meal Kit",
          mealKit,
        });
      }
    } catch (err) {
      res.status(500).render("error", {
        title: "Error",
        status: 500,
        message: "An error occurred while fetching the meal kit.",
        error: err,
      });
    }
  }
});

router.post("/delete/:id", async (req, res) => {
  mealKitModel
    .deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(200).render("error", {
        title: "Success",
        status: 200,
        message: "Meal kit deleted successfully.",
        error: {},
      });
    })
    .catch((err) => {
      res.status(500).render("error", {
        title: "Error",
        status: 500,
        message: "An error occurred while deleting the meal kit.",
        error: err,
      });
    });
});

module.exports = router;