const mealUtil = require("../modules/mealkit-util.js");
const userModel = require("../modules/userModel.js");
const bcrypt = require("bcryptjs");

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const meals = mealUtil.getAllMealKits();
    const featuredMeals = mealUtil.getFeaturedMealKits(meals);

    res.render("general/home", {
        title: "Home",
        featuredMeals
    });
    
});

router.get('/log-in', (req, res) => {
    res.render("general/log-in", {
        title: "Log In",
        validationMessages : {},
        values: {
            email: "",
            password: ""
        }
    });
});

router.post('/log-in', async (req, res) => {
    console.log(req.body);

    const { email, password, role } = req.body;

    let passedValidation = true;
    let validationMessages = {};

    if(typeof email !== "string") {
        passedValidation = false;
        validationMessages.email = "You must specify an email address.";
    }
    else if(email.trim().length === 0) {
        passedValidation = false;
        validationMessages.email = "Email is required.";
    }

    if(typeof password !== "string") {
        passedValidation = false;
        validationMessages.password = "You must specify a password.";
    }
    else if(password.trim().length === 0) {
        passedValidation = false;
        validationMessages.password = "Password is required.";
    }

    const existingUser = await userModel.findOne({ email });

    if(existingUser) {
        bcrypt.compare(password, existingUser.password)
            .then(matched => {
                if(matched) {

                    req.session.user = existingUser;
                    req.session.role = role;

                    console.log("Loged in.");

                    //redirect cart or list
                    if(role === "customer") {
                        return res.redirect("/cart");
                    }
                    else if(role === "dataClerk") {
                        return res.redirect("/mealkits/list");
                    }

                }else {
                    console.log("Invalid password.");
                    validationMessages.authentication = "Invalid email or password.";
                    res.render("general/log-in", {
                        title: "Log In",
                        validationMessages,
                        values : req.body
                    });
                }
            })
            .catch(err => {
                console.log(err);
                console.log("Unable to compare");
                validationMessages.authentication = "Invalid email or password.";
            });

    }
    else if(!existingUser) {
        validationMessages.authentication = "Invalid email or password.";

        res.render("general/log-in", {
            title: "Log In",
            validationMessages,
            values : req.body
        });
    }
    else if(passedValidation) {

        res.render("general/welcome", {
            title: "Welcome"
        });

    }
    else {
        res.render("general/log-in", {
            title: "Log In",
            validationMessages,
        });
    }

});

router.get('/sign-up', (req, res) => {
    res.render("general/sign-up", {
        title: "Sign Up",
        validationMessages : {},
        values: {
            firstName: "",
            lastName: "",
            email: "",
            password: ""
        }
    });
});

router.post('/sign-up', async (req, res) => {
    console.log(req.body);

    const { firstName, lastName, email, password } = req.body;

    let passedValidation = true;
    let validationMessages = {};
    //Regular expression for email validation, AI assisted
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //Regular expression for password validation, AI assisted
    const passwordRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if(typeof firstName !== "string") {
        passedValidation = false;
        validationMessages.firstName = "You must specify a first name.";
    }
    else if(firstName.trim().length === 0) {
        passedValidation = false;
        validationMessages.firstName = "First name is required.";
    }
    else if(firstName.trim().length < 2) {
        passedValidation = false;
        validationMessages.firstName = "First name is too short.";
    }

    if(typeof lastName !== "string") {
        passedValidation = false;
        validationMessages.lastName = "You must specify a last name.";
    }
    else if(lastName.trim().length === 0) {
        passedValidation = false;
        validationMessages.lastName = "Last name is required.";
    }
    else if(lastName.trim().length < 2) {
        passedValidation = false;
        validationMessages.lastName = "Last name is too short.";
    }

    if(typeof email !== "string") {
        passedValidation = false;
        validationMessages.email = "You must specify an email address.";
    }
    else if(email.trim().length === 0) {
        passedValidation = false;
        validationMessages.email = "Email is required.";
    }
    else if(!emailRegex.test(email)) {
        passedValidation = false;
        validationMessages.email = "Email must be valid.";
    }

    if(typeof password !== "string") {
        passedValidation = false;
        validationMessages.password = "You must specify a password.";
    }
    else if(password.trim().length === 0) {
        passedValidation = false;
        validationMessages.password = "Password is required.";
    }
    else if(password.trim().length < 8 || password.trim().length > 12) {
        passedValidation = false;
        validationMessages.password = "Password must be between 8 and 12 characters long.";
    
    }else if(!/[a-z]/.test(password)) {
        passedValidation = false;
        validationMessages.password = "Password must contain at least one lowercase letter.";
    }
    else if(!/[A-Z]/.test(password)) {
        passedValidation = false;
        validationMessages.password = "Password must contain at least one uppercase letter.";
    }
    else if(!/\d/.test(password)) {
        passedValidation = false;
        validationMessages.password = "Password must contain at least one number.";
    }
    else if(!passwordRegex.test(password)) {
        passedValidation = false;
        validationMessages.password = "Password must contain at least one special character.";
    }

    const existingUser = await userModel.findOne({ email });

    if(existingUser) {
        validationMessages.email = "Email already exists.";

        res.render("general/sign-up", {
            title: "Sign Up",
            validationMessages,
            values: req.body
        });
    }
    else if(passedValidation) {
        const FormData = require('form-data');
        const Mailgun = require('mailgun.js');

        const mailgun = new Mailgun(FormData);

        const mg = mailgun.client({ 
            username: 'api', 
            key: process.env.MAILGUN_API_KEY
        });
        
        const newUser = new userModel({
            firstName,
            lastName,
            email,
            password
        });

        newUser.save()
            .then(user => {

                console.log("User saved to database.");
                req.session.user = newUser;

                mg.messages.create("sandboxc538a47bb4c14e3c86e9d2305df5bcdf.mailgun.org", {
                    from: "Mailgun Sandbox <postmaster@sandboxc538a47bb4c14e3c86e9d2305df5bcdf.mailgun.org>",
                    to: [`${user.firstName} ${user.lastName} <${user.email}>`],
                    subject: `Hello ${user.firstName} ${user.lastName}`,
                    html: `Thank you ${user.firstName} ${user.lastName} for signing up with our meal kit service! We're excited to have you on board.<br>
                    Best regards, <br>
                    Juan Diego Correa Noy`,

                }).then(data => {
                    console.log(data);

                    res.redirect("/welcome");

                }).catch(err => {

                    console.error(err);
                    console.log("No message sent");
                    res.redirect("/welcome");
                });

            }).catch(err => {

                console.error(err.stack);
                console.log("Not added");
                res.status(err.status || 500).render("error", {
                    title: "Error",
                    status: err.status || 500,
                    message: err.message || "Something broke!",
                    error: err
                });

            });
            
    }
    else {
        
        res.render("general/sign-up", {
            title: "Sign Up",
            validationMessages,
            values: req.body
        });

    }

});

router.get('/welcome', (req, res) => {

    res.render("general/welcome", {
        title: "Welcome"
    });
});

router.get('/log-out', (req, res) => {
    req.session.destroy();
    res.redirect('/log-in');
});

router.get('/cart', (req, res) => {

    if (req.session.role !== "customer" || !req.session.user) {
        return res.status(401).render("error", {
            title: "Error",
            status: 401,
            message: "You are not authorized to view this page",
            error: {}
        });
    }else {
        res.render("general/cart", {
            title: "Cart"
        });
    }
});

module.exports = router;