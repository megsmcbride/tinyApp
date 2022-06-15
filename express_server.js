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
}

const user = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@email.com",
    password: "password"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user@email.com",
    password: "password"
  }
}
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
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
    username: req.cookies["username"],
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  let id = generateRandomString();
  users.push({
    id: {
      id,
      email: req.body.email,
      password: req.body.password
    }
  })
});

//login and logout
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username', req.body.username);
  res.redirect('/urls');
});

// new url
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render('urls_new', templateVars);
});

//Short url
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
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