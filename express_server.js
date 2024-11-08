const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const generateRandomString = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 6;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Main page, to be reworked
app.get("/", (req, res) => {
  res.send("<h1>Welcome to TinyApp!</h1>");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Current main page of app, displays list of URLs and shortURLs
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
   };
  res.render("urls_index", templateVars)
});

// Route to add a new shortURL
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

// Route to view one particular URL
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("URL Not Found.");
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

// 
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL Not Found.");
  }
});

// Route for "new shortURL" form 
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`); 
});

// Route for delete form
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("URL Not Found.");
  }

  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

// Route for login form
app.post("/login", (req, res) => {
  const { username } = req.body;
  if(username){
    res.cookie('username', username);
    return res.redirect("/urls");
  };
  return res.status(400).send("Username error.");
});

// Route for logout form
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  return res.redirect("/urls");
})
