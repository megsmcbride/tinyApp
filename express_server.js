const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require('body-parser');
const res = require('express/lib/response');
const req = require('express/lib/request');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const generateRandomString = (length = 6) => {
  return Math.random().toString(20).substr(2, length);
};

const getUser = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@email.com",
    password: "password"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@email.com",
    password: "password"
  }
};
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});


app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  let id = generateRandomString();
  const user = {
    id,
    email: req.body.email,
    password: req.body.password
  };
  if (!email || !password) {
    res.status(400).send('Invalid email and/or password');
    return;
  }
  if (getUser(email)) {
    res.status(400).send(`Email address: ${email} already in use `);
    return;
  }
  users[id] = user;
  res.cookie('user_id', id);
  res.redirect('/urls');
});

//login and logout
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Invalid email and/or password');
    return;
  }
  const user = getUser(email);
  if (!user) {
    res.status(403).send(`Email address: ${email} cannot be found`);
    return;
  }
  if (user.password !== password) {
    res.status(403).send("Invalid password");
    return;
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id', req.cookies.user_id);
  res.redirect('/urls');
});

// new url
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render('urls_new', templateVars);
});

//Short url
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id]
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

//delete short url
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});