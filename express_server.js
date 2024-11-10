const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { findUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const methodOverride = require("method-override");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(methodOverride('_method'))
app.use(cookieSession({
  name: 'session',
  keys: ['a-very-strong-key-1', 'an-even-stronger-key-2'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// GLOBAL VARIABLES

// URL database for saved URLs
const urlDatabase = {};

// User database for saved users
const users = {};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// GET REQUESTS

// GET route for main page, redirect to "/register"
app.get("/", (req, res) => {
  return res.redirect("/register");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// GET route for URLs page
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

    // Check if user is logged in. If not, message displayed to redirect to login or register pages
   if(!user) {
    return res.status(401).render("error-page", {
      errorCode: "401 Unauthorized",
      message: "You need to be logged in to view shortened URLs"
    });
  }

    // Check for user-specific urls created to send to HTML file
  const templateVars = { 
    urls: urlsForUser(userID, urlDatabase),
    user,
   };

  return res.render("urls_index", templateVars)
});

// GET route to view ADD NEW page
app.get("/urls/new", (req, res) => {

  const userID = req.session.user_id;
  const user = users[userID];

  const templateVars = { 
    urls: urlDatabase,
    user
  };

  // If not logged in, redirect to login page
  if(!user) {
    return res.redirect("/login");
  }

  return res.render("urls_new", templateVars);
});


// GET route to view one particular URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_ID = req.session.user_id;
  const user = users[user_ID];
  const urlEntry = urlDatabase[id];

  // If user is not logged in, provide message with redirect links
  if(!user) {
    return res.status(401).render("error-page", {
      errorCode: "401 Unauthorized",
      message: "You need to be logged in to view individual URLs."
      
    })
  }

  // If shortURL does not exist, send error
  if (!urlEntry.longURL) {
    return res.status(404).send("URL Not Found.");
  }

  // If shortURL does not belong to user, send error
  if (urlEntry.userID !== user_ID) {
    return res.status(403).render("error-page", {
      errorCode: "403 Forbidden",
      message: "You do not have permission to view this URL."
    });
  }

  const templateVars = { 
    id, 
    longURL: urlEntry.longURL, 
    user
  };

  res.render("urls_show", templateVars);
});


// GET route for specific shortURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  if(!urlDatabase[id]) {
    return res.status(404).render("error-page", {
      errorCode: "404 Not Found",
      message: "URL Not Found."
    });
  }

  const longURL = urlDatabase[id].longURL;

  if (longURL) {
    res.redirect(longURL);
  } else {
    return res.status(404).send("error-page", {
      errorCode: "404 Not Found",
      message: "URL Not Found."
    });
  }
});


// GET route for register page
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  const templateVars = {
    urls: urlDatabase,
    user
  };

  // Redirect user to /urls if already logged in
  if(user) {
    return res.redirect("/urls");
  }
  return res.render("register", templateVars)
});


// GET route for login page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  const templateVars = {
    urls: urlDatabase,
    user
  };

  // Redirect user to /urls if already logged in
  if (user) {
    return res.redirect("/urls");
  }
  return res.render("login", templateVars)
});



//POST REQUESTS

// Route for NEW SHORTURL form 
app.post("/urls", (req, res) => {

  // If not logged in as register user, send user "unauthorized" message
  if(!req.session.user_id) {
    return res.status(401).render("error-page", {
      errorCode: "401 Unauthorized",
      message: "You must be logged in to shorten URLs."
    });
  };

  // creates new shortURL using generateRandomString
  const id = generateRandomString();
  const longURL = req.body.longURL;

  // Enters new url object into database with newly generated id, long URL from req and userID from cookie
  urlDatabase[id] = { longURL, userID: req.session.user_id };
  res.redirect(`/urls/${id}`); 
});


// Route for REGISTER form
app.post("/register", (req, res) => {

  // Generate number for new user and grab input info
  const userID = generateRandomString();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // If user did not enter email or password, send error message to user. 
  if (!email || !password) {
    return res.status(400).render("error-page", {
      errorCode: "400 Bad Request",
      message: "Enter email and password."
    });
  };

  // Check if email is already registered and return error if true. 
  if (findUserByEmail(email, users)) {
    return res.status(400).render("error-page", {
      errorCode: "400 Bad Request",
      message: "Email already registered, navigate to login page or try again with new email address."
    });
  };

  // Create new user object with input info and generated id
  const newUser = {
    id: userID,
    email,
    hashedPassword
  };

  // Add new user with ID to global users object
  users[userID] = newUser;
  
  // Set cookie with user id
  req.session.user_id = userID;

  // Redirect to /urls page once complete
  return res.redirect("/urls");
});


// Route for LOGIN form
app.post("/login", (req, res) => {

  const { email, password } = req.body;

  // Confirm user via entered email by checking stored users
  const user = findUserByEmail(email, users);

  // If valid user, check that entered password matches records, redirect to /urls if correct
  if(user) {
    if (bcrypt.compareSync(password, user.hashedPassword)) {
      req.session.user_id = user.id;
      return res.redirect("/urls");
    } else {
      res.status(403).render("error-page", {
        errorCode: "403 Forbidden",
        message: "Password incorrect. Please enter valid password."
      });
    }
  }
  return res.status(403).render("error-page", {
    errorCode: "403 Forbidden",
    message: "Email not found. Please enter valid email or navigate to register page."
  });
});


// Route for LOGOUT form
app.post("/logout", (req, res) => {

  // Clear the user_id cookie upon logging out
  req.session = null;
  return res.redirect("/login");
});


// Route for EDIT form
app.put("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_ID = req.session.user_id;
  const user = users[user_ID];
  const urlEntry = urlDatabase[id];

  // If not logged in, send error message.
  if(!req.session.user_id) {
    return res.status(401).render("error-page", {
      errorCode: "401 Unauthorized",
      message: "You must be logged in to edit URLs."
    });
  }

  // If URL does not exist.
  if (!urlDatabase[req.params.id].longURL) {
    return res.status(404).render("error-page", {
      errorCode: "404 Not Found",
      message: "URL Not Found."
    });
  }

  if (urlEntry.userID !== user_ID) {
    return res.status(403).render("error-page", {
      errorCode: "403 Forbidden",
      message: "You do not have permission to edit this record."
    })
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  return res.redirect("/urls");
});


// Route for DELETE form
app.delete("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_ID = req.session.user_id;
  const user = users[user_ID];
  const urlEntry = urlDatabase[id];

  if(!urlEntry) {
    return res.status(404).render("error-page", {
      errorCode: "404 Not Found",
      message: "URL Not Found."
    });
  }

  // If not logged in, send error message.
  if(!user) {
    return res.status(401).render("error-page", {
      errorCode: "401 Unauthorized",
      message: "You must be logged in to delete URLs."
    });
  };

  if (urlEntry.userID !== user_ID) {
    return res.status(403).render("error-page", {
      errorCode: "403 Forbidden",
      message: "You do not have permission to delete this record."
    })
  }
  
  delete urlDatabase[id];
  return res.redirect("/urls");
});