/*************************************************************************************
* WEB322 - 2261 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Juan Diego Correa Noy
* Student ID    : 115889248
* Student Email : jdcorrea-noy@myseneca.ca
* Course/Section: WEB322/NCC
*
**************************************************************************************/

const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");

//dotenv
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "config/.keys") });

//express
const app = express();

//body parser
app.use(express.urlencoded({ extended: true }));

//set up static folder
app.use(express.static(path.join(__dirname, "public")));

//ejs
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.set("layout", "layouts/main");
app.use(expressLayouts);

//expression-session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));


app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.role = req.session.role;
    next();
});

// Controllers
const generalController = require("./controllers/generalController");
const mealkitController = require("./controllers/mealkitsController");

app.use("/", generalController);
app.use("/mealkits", mealkitController);


// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.

// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).render("error", {
        title: "Error",
        status: 404,
        message: "Page Not Found",
        error: null
    });
});

// This use() will add an error handler function to
// catch all errors.
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(err.status || 500).render("error", {
        title: "Error",
        status: err.status || 500,
        message: err.message || "Something broke!",
        error: err
    });
});


// *** DO NOT MODIFY THE LINES BELOW ***

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
  


//set up mongoose connection
mongoose.connect(process.env.DB_KEY).then(() => {
    console.log("Connected to MongoDB");

    // Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
    // because sometimes port 80 is in use by other applications on the machine
    app.listen(HTTP_PORT, onHttpStart);

}).catch((err) => {
    console.error("Error connecting to MongoDB ", err);
});