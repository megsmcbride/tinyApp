const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require('body-parser');
const res = require('express/lib/response');
app.use(bodyParser.urlencoded({extended: true}))

app.set('view engine', 'ejs');

function generateRandomString(length = 6) {
  return Math.random().toString(20).substr(2,length)
}

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString()
  urlDatabase[newShortURL] = req.body.longURL
  res.redirect(`/urls/${newShortURL}`);
});

app.post('/urls/login', (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls')
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL])
})


app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect('/urls') 
});

app.post('/urls/:shortURL/delete',(req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls')
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});