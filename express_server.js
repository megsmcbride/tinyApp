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

app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = { longURL: req.body.longURL, userID: req.session.userID };
  res.redirect(`/urls/${newShortURL}`);
});

app.get('/urls/new', (req, res) => {
  if (!req.session.userID) {
    return res.redirect('/login');
  }
  const templateVars = {
    user: usersDatabase[req.session.userID]
  };
  res.render('urls_new', templateVars);
});

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

app.post('/urls/:shortURL', (req, res) => {

  urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: req.session.userID };
  res.redirect('/urls');

});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (!req.session.userID) {
    return res.status(403).send("Access denied");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

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

app.get('/login', (req, res) => {
  const templateVars = {
    user: usersDatabase[req.session.userID],
    message: null,
    status: null
  };
  res.render('login', templateVars);
});

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

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});