const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcryptjs');
const { getUser, generateRandomString, urlsForUser } = require('./helpers');


const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['asdf09safl', 'll2k34j3lk324j'],
}));
app.set('view engine', 'ejs');


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const usersDatabase = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@email.com",
    password: bcrypt.hashSync("password", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@email.com",
    password: bcrypt.hashSync("password", 10)
  }
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Checks if user is logged in and redirects to urls page, 
// if logged out redirects to login page.
app.get('/', (req, res) => {
  const userID = req.session.userID;
  const user = usersDatabase[userID];

  if (!user) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Checks if user is logged in and returns users urls found in the
// database then displays to urls page and if logged out displays error message. 
app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  const user = usersDatabase[userID];

  if (!user) {
    const templateVars = {
      message: "User is not logged in",
      status: 401,
      user: null
    };
    return res.status(401).render('urls_index', templateVars);
  }

  let userURLs = urlsForUser(userID, urlDatabase);
  const templateVars = {
    user: usersDatabase[req.session.userID],
    urls: userURLs
  };
  res.render('urls_index', templateVars);
});

// Generates random id for when creating shotURL and saves to the url database with userID.
app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = { longURL: req.body.longURL, userID: req.session.userID };
  res.redirect(`/urls/${newShortURL}`);
});

// Checks if user is logged in and displays create new url page
// if logged out redirects to login.
app.get('/urls/new', (req, res) => {
  const userID = req.session.userID;
  const user = usersDatabase[userID];
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = {
    user: usersDatabase[req.session.userID]
  };
  res.render('urls_new', templateVars);
});

// Checks if shortURL exists in database, if found takes to the matching longURL 
// if not found displays error message.
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    const templateVars = {
      message: "Page does not exist",
      status: 404,
      user: usersDatabase[req.session.userID],
    };
    return res.status(404).render('error', templateVars);
  }
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Checks if user is logged in, if the the shortURL exists in database and if the userID matches the shortURLs id
// if any of are false dispalys error page
// if all are true displays the urls_show page for the shortURL.
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.userID;
  const user = usersDatabase[userID];

  if (!urlDatabase[req.params.shortURL]) {
    const templateVars = {
      message: "Page does not exist",
      status: 404,
      user: null
    };
    return res.status(404).render('error', templateVars);
  }

  const verifyURLUser = urlDatabase[req.params.shortURL].userID === user;

  if (!user || !verifyURLUser) {
    const templateVars = {
      message: "Access denied",
      status: 403,
      user: null
    };
    return res.status(403).render('error', templateVars);
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: usersDatabase[req.session.userID]
  };

  res.render('urls_show', templateVars);
});

// Saves created shortURL to url database.
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: req.session.userID };
  res.redirect('/urls');

});

// Checks if user is logged in and allows them to delete their own urls.
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.userID;
  const user = usersDatabase[userID];
  if (!user) {
    return res.status(403).send("Access denied");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Checks if user is logged in and redirects to urls page
// if not logged in dispalys register page.
app.get('/register', (req, res) => {
  const userID = req.session.userID;
  const user = usersDatabase[userID];
  if (user) {
    return res.redirect('urls');
  }
  const templateVars = {
    user: usersDatabase[req.session.userID],
  };
  res.render('register', templateVars);
});

// Checks if email and password are valid displaying error if not
// Checks if user exists in database displaying error if found
// If valid email and password saves to userDatabase with password encryption.
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  let userID = generateRandomString();
  if (!email || !password) {
    const templateVars = {
      message: "Invalid email/password.  Please try again",
      status: 404,
      user: usersDatabase[req.session.userID],
    };
    return res.status(404).render('register', templateVars);
  }
  if (getUser(email, usersDatabase)) {
    const templateVars = {
      message: "User exists, please login ",
      status: 404,
      user: usersDatabase[req.session.userID],
    };
    return res.status(404).render('register', templateVars);
  }

  usersDatabase[userID] = {
    id: userID,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.userID = userID;
  res.redirect('/urls');
});

// Checks if user is logged in and redirect to urls if true
// If logged out then displays login page
app.get('/login', (req, res) => {
  const userID = req.session.userID;
  const user = usersDatabase[userID];
  if (user) {
    return res.redirect('urls');
  }

  const templateVars = {
    user: usersDatabase[req.session.userID],
    message: null,
    status: null
  };
  res.render('login', templateVars);
});

// Checks if email is in user database, if not found displays error
// Checks if inputted password matches store email password
// If matches redirects to urls page, if invalid then displays error
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUser(email, usersDatabase);
  if (!user) {
    const templateVars = {
      message: "Invalid email/password. Please try again",
      status: 404,
      user: usersDatabase[req.session.userID],
    };
    return res.status(404).render('login', templateVars);
  }

  const verifyPassword = bcrypt.compareSync(password, getUser(email, usersDatabase).password);
  if (!verifyPassword) {
    const templateVars = {
      message: "Invalid email/password.  Please try again",
      status: 404,
      user: usersDatabase[req.session.userID],
    };
    return res.status(404).render('login', templateVars);
  }

  req.session.userID = user.id;
  res.redirect('/urls');
});

//deletes user cookie when logged in and logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});