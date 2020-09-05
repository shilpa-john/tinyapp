const PORT           = 8080; //default port 8080
const express        = require("express");
const bcrypt         = require('bcrypt');
const app            = express();
const bodyParser     = require("body-parser");
const cookieSession  = require('cookie-session');
const {emailLookUp} = require('./helpers');
const {urlsForUser} = require('./helpers');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['iamasuperheroandilikesongs', 'pouet pouet spaces are okay why not']
}));


app.set("view engine", "ejs");


//Data organised in the url Database
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca",    userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID"}
};

//Data in the users database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// GET '/' sends logged in users to the '/urls' page and logged out users to the '/login' page
app.get('/', (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//To Create a new URL!
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
   return res.redirect("/login");
}
let templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

//Display URL made by user
app.get("/urls", (req, res) => {
  const urlsOfUserDatabase = urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = { user: users[req.session.user_id], urls: urlsOfUserDatabase };
  res.render("urls_index", templateVars);
});

app.get('/register', (req, res) => {
    let templateVars = {user: users[req.session.user_id]};
    res.render("urls_registration", templateVars);
});

//Register
app.post('/register', (req, res) => {
  if(!req.body.email && !req.body.password)  {
    res.status(400).send("Invalid details");
    return;
  } else if(emailLookUp(req.body.email, users)) {
    res.status(400).send("User exists!");
    return;
  } else {
    let newUser = generateRandomString();
    const password = bcrypt.hashSync(req.body.password, 10);
    users[newUser] = {
      id: newUser,
      email: req.body.email,
      password: password
    };
    req.session.user_id = newUser;
    res.redirect('/urls');
  }
});


// Login-Authentication
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});


//Login 
app.post("/login", (req, res) => {
  const email    = req.body.email;  
  const password = req.body.password;
  const user = emailLookUp(email, users);
  if (user) {
    const hashedPassword = users[user].password;
    if (bcrypt.compareSync(password, hashedPassword)) {
      req.session.user_id = user;
      res.redirect("/urls");
    } else {
      res.status(403).send("Wrong Password");
    }
  } else {
    res.status(403).send("User Not Found");
  }
  });


//Login not required here, user is redirected to longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL =  urlDatabase[shortURL].longURL;
  if (Object.keys(urlDatabase).includes(shortURL)) {
    res.redirect(longURL);
  } else {
    res.redirect("urls_index", { urls: urlDatabase });
  }
});

//Create new URL
app.post("/urls", (req, res) => {
  const Id     = generateRandomString();
  const userID = req.session.user_id;
  if (req.body.longURL.match(/^(https:\/\/|http:\/\/)/)) {
    const longURL   = req.body.longURL;
    urlDatabase[Id] = { longURL, userID };
  } else {
    const longURL = "http://" + req.body.longURL;
    urlDatabase[Id] = { longURL, userID };
  }
  res.redirect(`/urls/${Id}`);
});

//Edit URL
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.session.user_id],
    userID: urlDatabase[req.params.shortURL].userID,
    urls: urlsForUser(req.session.user_id, urlDatabase),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});


//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userid =  users[req.session.user_id].id;
  const userID = urlDatabase[req.params.shortURL].userID;
  if (!userid  || userid !== userID) {
    return res.redirect("/urls");
  }
  delete urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect("/urls");
});


//Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});


//For logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


//Establishing connection with local server
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});