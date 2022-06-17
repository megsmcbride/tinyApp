const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcryptjs');
const { getUser } = require('./helpers')


const bodyParser = require('body-parser');
const res = require('express/lib/response');
const req = require('express/lib/request');
const cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['userID'],
}));
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


//existing users database
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

const urlsForUser = id => {
  let userURLs = {}
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = { ...urlDatabase[shortURL] }
      }
    }
  return userURLs
}

// app.get('/home', (req, res) => { // read '/' and redirects to /urls
//   if (!user) {
//     res.render('home_page', templateVars)
//   }
// });

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
  if (!req.session.userID) {
    res.redirect('/login')
  }
  const templateVars = {
    user: usersDatabase[req.session.userID]
  };
  res.render('urls_new', templateVars);
});



app.get('/urls', (req, res) => {
  const userID = req.session.userID
  if (!userID) {
    const templateVars = {
      message: "User is not logged in",
      status: 401,
      user: null
    }
    return res.status(401).render('urls_index', templateVars)
  }
  let userURLs = urlsForUser(userID)  
  const templateVars = {
    user: usersDatabase[req.session.userID],
    urls: userURLs
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = { longURL: req.body.longURL, userID: req.session.userID};
  console.log(urlDatabase)
  res.redirect(`/urls/${newShortURL}`);
});

//Short url
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    urls: urlDatabase[req.params.shortURL],
    user: usersDatabase[req.session.userID]
  };
  console.log(templateVars.urls)
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  if(!req.session.userID) {
    return res.status(403).send("Access denied");
  }
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: usersDatabase[req.session.userID],
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  let userID = generateRandomString();
  if (!email || !password) {
    return res.status(400).send('Invalid email and/or password');
    
  }
  if (getUser(email, usersDatabase)) {
    return res.status(400).send(`Email address: ${email} already in use `);
  }
  console.log("We passed so far", userID, )
  usersDatabase[userID] = {
    id: userID,
    email,
    password: bcrypt.hashSync(password,10)
  };
  req.session.userID = userID
  res.redirect('/urls');
});

//login and logout
app.get('/login', (req, res) => {
  const templateVars = {
    user: usersDatabase[req.session.userID]
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const verifyPassword = bcrypt.compareSync(password, getUser(email, usersDatabase).password);
  const user = getUser(email, usersDatabase);
  
  if (!email || !password) {
    return res.status(400).send('Invalid email and/or password');
  }
  if (!user) {
    return res.status(403).send(`Email address: ${email} cannot be found`);
  }
  if (!verifyPassword) {
    return res.status(403).send("Invalid password");
  }

  req.session.userID = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null
  res.redirect('/login');
});


//delete short url
app.post('/urls/:shortURL/delete', (req, res) => {
  if (!req.session.userID) {
    return res.status(403).send("Access denied");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});