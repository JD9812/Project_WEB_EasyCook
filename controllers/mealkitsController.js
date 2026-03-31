const mealUtil = require("../modules/mealkit-util.js");

const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {

    const meals = mealUtil.getAllMealKits();
    const categoryMeals = mealUtil.getMealKitsByCategory(meals);


    res.render("mealkits/on-the-menu", {
        title: "Menu",
        categoryMeals
    });
});

router.get('/list', (req, res) => {

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
            user: req.session.user
        });
    }

});

module.exports = router;