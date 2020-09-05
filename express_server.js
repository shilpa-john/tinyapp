const express = require("express");
const app     = express();
const PORT    = 8080; //default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");
const { emailLookUp} = require('./helpers');
const { urlsForUser } = require('./helpers');
//const bcrypt = require('bcrypt');


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJurls48lW" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
   return res.redirect("/login");
}
let templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

/*app.get("/u/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: "http://www.lighthouselabs.ca"};
  res.render("urls_show", templateVars);
});*/


app.get("/login", (req, res) => {
  var user = {};
  const userId = req.cookies.user_id;
  console.log(userId);
  let templateVars = { user: users[userId] };
  res.render("login", templateVars);
});

/*app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = "http://www.lighthouselabs.ca";
  res.redirect(longURL);
})*/

app.get("/urls", (req, res) => {
  var user = {};
  const userId = req.cookies.user_id;
  const urlsOfUserDatabase = urlsForUser(userId, urlDatabase);
  console.log(userId);
  if(userId)
  {
    user =  users[userId];
   }
  let templateVars = { user: user, urls: urlsOfUserDatabase };
  res.render("urls_index", templateVars);
});

app.get('/register', (req, res) => {
  const userId = req.cookies.user_id;
  if (users[userId]) {
    res.redirect('/urls');
  }else{
    let templateVars = {user: users[userId]};
    res.render("urls_registration", templateVars);
  }
});

app.post('/register', (req, res) => {
  if(!req.body.email && !req.body.password)  {
    res.status(400).send("Invalid details");
    return;
  } else if(emailLookUp(req.body.email, users)) {
    res.status(400).send("User exists!");
    return;
  } else {
    let newUser = generateRandomString();
    users[newUser] = {
      id: newUser,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', newUser);
    res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {
  const email    = req.body.email;  
  const password = req.body.password;
  const user = emailLookUp(email, users);
  console.log("Testing the user", user);
  if (user) {
    console.log("Testing user.password",user.password);
    if (password === user.password) {
      res.cookie('user_id', user.id);
      console.log("hello");
      return res.redirect("/urls");
    } else {
      return res.status(403).send("Wrong Password");
    }
  } else {
    res.status(403).send("User Not Found");
  }
  });


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  console.log(shortURL);
  if (Object.keys(urlDatabase).includes(shortURL)) {
    res.redirect(longURL);
  } else {
    res.redirect("urls_index", { urls: urlDatabase });
  }
});

app.post("/logout", (req, res) => {
  res.cookie('user_id', "");
  res.redirect("/urls");
});

// GET '/' sends logged in users to the '/urls' page and logged out users to the '/login' page
/*app.get('/', (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});*/


app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});


//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userid =  users[req.cookie.user_id].id;
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
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});