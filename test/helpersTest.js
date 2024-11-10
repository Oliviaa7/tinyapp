const { assert } = require('chai');
const { findUserByEmail } = require('../helpers');
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

describe('findUserByEmail', () => {
  it('should return a user when passed a valid email', () => {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.deepEqual(user.id, expectedUserID);
  });

  it('should return undefined when passed an invalid email', () => {
    const user = findUserByEmail("invalid@example.com", testUsers)
    const expectedResult = undefined;
    assert.strictEqual(user, expectedResult);
  })
});
