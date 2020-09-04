const emailLookUp =  (email, usersdB) => {
 for(const user in usersdB){
    //console.log(user);
    if(usersdB[user].email === email){
      return usersdB[user];
    }
  }
  return false;
};
//it looks up for existing email ids of users
module.exports = { emailLookUp } ;