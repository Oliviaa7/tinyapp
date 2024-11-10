const { assert } = require('chai');
const { findUserByEmail, urlsForUser } = require('../helpers');

describe('findUserByEmail', () => {

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

describe('urlsForUser', () => {
  
  it('should return urls that belong to the specified user', () => {

  const urlDatabase = {
    "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
    "9sm5xK": { longURL: "http://www.google.com", userID: "user2" },
    "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
  };

    // Define expected output
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
    };

    // Call the function with userId 'user1'
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result matches the expected output
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the user has no URLs', () => {
    // Create a sample urlDatabase where no URL belongs to user 'user1'
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user2" },
      "9sm5xK": { longURL: "http://www.google.com", userId: "user3" }
    };

    // Call the function with userId 'user1' who does not have any URLs
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result is an empty object
    assert.deepEqual(result, {});
  });

  it('should return an empty object if the urlDatabase is empty', () => {
    // Create an empty urlDatabase
    const urlDatabase = {};

    // Call the function with any userId (e.g., 'user1')
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result is an empty object
    assert.deepEqual(result, {});
  });
});