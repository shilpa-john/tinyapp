const emailLookUp =  (email, usersdB) => {
 for(const user in usersdB){
    //console.log(user);
    if(usersdB[user].email === email){
      return usersdB[user];
    }
  }
  return false;
};

//only contains urls which were created by the user in question
const urlsForUser = (id, database) => {
  const UrlsOfUser = {};
  for (const url in database) {
    if (database[url].userID === id) {
      UrlsOfUser[url] = database[url];
    }
  }
  return UrlsOfUser;
};
//it looks up for existing email ids of users
module.exports = { emailLookUp , urlsForUser} ;