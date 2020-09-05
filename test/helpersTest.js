const { assert }      = require('chai');
const { emailLookUp } = require('../helpers.js');

const testUsers = {
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
};

describe('emailLookUp', function() {
  it('should return a user with valid email', function() {
    const user = emailLookUp("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined with an invalid email', function() {
    const user = emailLookUp("", testUsers)
    const expectedOutput = "";
    assert.equal(user, expectedOutput)
  });

  it('should return a user object with a valid email', function() {
    const user = testUsers[emailLookUp("user@example.com", testUsers)]
    const expectedOutput = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user, expectedOutput)
  });
});