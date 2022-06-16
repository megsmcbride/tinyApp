const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require('body-parser');
const res = require('express/lib/response');
const req = require('express/lib/request');
const cookieParser = require('cookie-parser'); //turns cookie into readable

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

//Store urls
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

//generates random string
const generateRandomString = (length = 6) => {
  return Math.random().toString(20).substr(2, length);
};

//sorts through users to compare if the email exists within the users database
const getUser = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

//existing users database
const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@email.com",
    password: "password"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@email.com",
    password: "password"
  }
};

const urlsForUser = id => {
  let userURLs = {}
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = { ...urlDatabase[shortURL] }
      }
    }
  console.log(userURLs)
  return userURLs
}

app.get('/', (req, res) => { // read '/' and redirects to /urls
  res.redirect('/urls')
});

app.get('/urls.json', (req, res) => {
  console.log(urlDatabase)
  res.json(urlDatabase);
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL
  if(!urlDatabase[shortURL]) {
    res.status(400).send(`Page does not exist`)
    return;
  }
  let longURL = urlDatabase[shortURL].longURL
  res.redirect(longURL);
})



// when clicking on create new it checks if you are logged in to be able to access this page
app.get('/urls/new', (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login')
  }
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render('urls_new', templateVars);
});

app.get('/urls', (req, res) => {
  const user_id = req.cookies.user_id
  if (!user_id) {
    const templateVars = {
      message: "User is not logged in",
      status: 401,
      user: null
    }
    return res.status(401).render('error', templateVars)
  }

  let usersURLs = urlsForUser(user_id);
  if (urlsForUser === {}) {
  }
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: usersURLs
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id };
  console.log(urlDatabase)
  res.redirect(`/urls/${newShortURL}`);
});

//Short url
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    urls: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id]
  };
  console.log(templateVars.urls)
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    error: null
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
    return res.status(400).send('Invalid email and/or password');
   
  }
  if (getUser(email)) {
    return res.status(400).send(`Email address: ${email} already in use `);
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
    return  res.status(400).send('Invalid email and/or password');
    
  }
  const user = getUser(email);
  if (!user) {
    return res.status(403).send(`Email address: ${email} cannot be found`);
  }
  if (user.password !== password) {
    return res.status(403).send("Invalid password");
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id', req.cookies.user_id);
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