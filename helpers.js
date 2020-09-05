//Function to check if the user already exists in the database
const emailLookUp =  (email, usersdB) => {
 for(const user in usersdB){
    if(usersdB[user].email === email){
      return user;
    }
  }
  return false;
};

//Only contains urls which were created by the user in question
const urlsForUser = (id, database) => {
  const UrlsOfUser = {};
  for (const url in database) {
    if (database[url].userID === id) {
      UrlsOfUser[url] = database[url];
    }
  }
  return UrlsOfUser;
};


//It looks up for existing email ids of users
module.exports = { emailLookUp , urlsForUser} ;