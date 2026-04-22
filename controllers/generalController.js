const mealUtil = require("../modules/mealkit-util.js");
const mealKitModel = require("../modules/mealKitModel");
const userModel = require("../modules/userModel.js");
const bcrypt = require("bcryptjs");

const express = require("express");
const router = express.Router();

router.get('/', async (req, res) => {

    try {
        const dbMealKits = await mealKitModel.find();
        const mealKits = dbMealKits.map(mealKit => mealKit.toObject());
        const featuredMeals = mealUtil.getFeaturedMealKits(mealKits);
        res.render("general/home", {
            title: "Home",
            featuredMeals
        });
    } catch (error) {
        console.error(error);
        res.status(500).render("error", {
            title: "Error",
            status: 500,
            message: "Internal Server Error",
            error: null
        });
    };
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
                err.message = "Unable to save user to database.";
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

const cartView = function (req, res, message) {
  let viewModel = {
    title: "Shopping Cart",
    message,
    hasMealKits: false,
    subtotal: 0,
    cartTotal: 0,
    tax: 0,
    mealKits: [],
  };

  if (req.session && req.session.user) {
    const cart = req.session.cart || [];

    viewModel.hasMealKits = cart.length > 0;

    let subTotal = 0;

    cart.forEach((kit) => {
      subTotal += kit.mealKit.price * kit.qty;
    });

    viewModel.subtotal = subTotal;
    viewModel.tax = subTotal * 0.1;
    viewModel.cartTotal = subTotal + viewModel.tax;
    viewModel.mealKits = cart;

    res.render("general/cart", viewModel);
  } else {
    return res.status(401).render("error", {
      title: "Error",
      status: 401,
      message: "You are not authorized to view this page",
      error: {},
    });
  }
};

router.get('/cart', (req, res) => {

    if (req.session.role !== "customer" || !req.session.user) {
        return res.status(401).render("error", {
            title: "Error",
            status: 401,
            message: "You are not authorized to view this page",
            error: {}
        });
    }else {
        cartView(req, res, "");
    }
});

router.get("/cart/:id", async (req, res) => {
  let message;
  const mealId = req.params.id;

  if (req.session.user) {
    try {
      const cart = (req.session.cart = req.session.cart || []);

      const mealKit = await mealKitModel.findById(mealId);

      if (!mealKit) {
        message = `Meal kit ${mealId} not found.`;
        return cartView(req, res, message);
      } else {
        let found = false;
        cart.forEach((meal) => {
          if (meal._id == mealId) {
            found = true;
            meal.qty++;
          }
        });
        if (found) {
          message = `${mealKit.title} Already in cart.`;
        } else {
          cart.push({
            _id: mealId,
            qty: 1,
            mealKit,
          });

          message = `${mealKit.title} added to cart.`;
        }

        return cartView(req, res, message);
      }
    } catch (err) {
      console.error(err.stack);
      return res.status(err.status || 500).render("error", {
        title: "Error",
        status: err.status || 500,
        message: err.message || "Unable to query DB.",
        error: err,
      });
    }
  } else {
    return res.status(401).render("error", {
      title: "Error",
      status: 401,
      message: "You must be logged in.",
      error: {},
    });
  }
});

router.get("/cart/remove/:id", async (req, res) => {
  let message;
  const mealId = req.params.id;

  if (req.session.user) {
    const cart = req.session.cart || [];

    const mealIndex = cart.findIndex((meal) => meal._id == mealId);

    if (mealIndex >= 0) {
      message = `${cart[mealIndex].mealKit.title} removed from cart.`;
      cart.splice(mealIndex, 1);
    } else {
      message = `Meal kit ${mealId} not found in cart.`;
    }
  } else {
    return res.status(401).render("error", {
      title: "Error",
      status: 401,
      message: "You must be logged in.",
      error: {},
    });
  }

  cartView(req, res, message);
});

router.post("/cart/update/:id", (req, res) => {
  let message;
  const mealId = req.params.id;
  const qty = req.body.qty;

  if (req.session.user) {
    const cart = req.session.cart || [];
    const meal = cart.find((meal) => meal._id === mealId);

    if (meal) {
      meal.qty = qty;

      message = `${meal.mealKit.title} quantity updated.`;
      return cartView(req, res, message);
    } else {
      message = `Meal kit ${mealId} not found in cart.`;
      return cartView(req, res, message);
    }
  } else {
    return res.status(401).render("error", {
      title: "Error",
      status: 401,
      message: "You must be logged in.",
      error: {},
    });
  }
});

router.post("/cart/place-order", async (req, res) => {
  if (req.session.user) {
    try {
      const cart = req.session.cart || [];

      if (cart.length > 0) {
        let subtotal = 0;
        let orders = "";

        cart.forEach((item) => {
          const orderTotal = Number(item.mealKit.price) * Number(item.qty);
          subtotal += orderTotal;

          orders += `
              <tr>
                <td style="padding:8px; border:1px solid #ccc;">${item.mealKit.title}</td>
                <td style="padding:8px; border:1px solid #ccc;">${item.mealKit.includes}</td>
                <td style="padding:8px; border:1px solid #ccc;">$${Number(item.mealKit.price).toFixed(2)}</td>
                <td style="padding:8px; border:1px solid #ccc;">${item.qty}</td>
                <td style="padding:8px; border:1px solid #ccc;">$${orderTotal.toFixed(2)}</td>
              </tr>
            `;
        });

        const tax = subtotal * 0.1;
        const cartTotal = subtotal + tax;

        const emailHtml = `
        <h1>Order Confirmation</h1>
        <p>Hello ${req.session.user.firstName},</p>
        <p>Thank you for your order. Here is your shopping cart summary:</p>
  
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th style="padding:8px; border:1px solid #ccc;">Meal Kit</th>
              <th style="padding:8px; border:1px solid #ccc;">Includes</th>
              <th style="padding:8px; border:1px solid #ccc;">Price</th>
              <th style="padding:8px; border:1px solid #ccc;">Quantity</th>
              <th style="padding:8px; border:1px solid #ccc;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orders}
          </tbody>
        </table>
  
        <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
        <p><strong>Tax (10%):</strong> $${tax.toFixed(2)}</p>
        <p><strong>Grand Total:</strong> $${cartTotal.toFixed(2)}</p>
  
        <p>We appreciate your order.</p>
      `;

        const FormData = require("form-data");
        const Mailgun = require("mailgun.js");

        const mailgun = new Mailgun(FormData);

        const mg = mailgun.client({
          username: "api",
          key: process.env.MAILGUN_API_KEY,
        });

        await mg.messages.create(
          "sandboxc538a47bb4c14e3c86e9d2305df5bcdf.mailgun.org",
          {
            from: "Mailgun Sandbox <postmaster@sandboxc538a47bb4c14e3c86e9d2305df5bcdf.mailgun.org>",
            to: [
              `${req.session.user.firstName} ${req.session.user.lastName} <${req.session.user.email}>`,
            ],
            subject: "Order Confirmation",
            html: emailHtml,
          },
        );

        req.session.cart = [];

        message = "Order placed successfully!";
        return cartView(req, res, message);
      } else {
        message = "Your cart is empty.";
        return cartView(req, res, message);
      }
    } catch (err) {
      console.error(err.stack);
      return res.status(err.status || 500).render("error", {
        title: "Error",
        status: err.status || 500,
        message: err.message || "Unable to process order.",
        error: err,
      });
    }
  } else {
    return res.status(401).render("error", {
      title: "Error",
      status: 401,
      message: "You must be logged in.",
      error: {},
    });
  }
});

module.exports = router;