// FUNCTIONS

// Function for generating random strings of 6 characters
const generateRandomString = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 6;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Function for looking up user by email
const findUserByEmail = function(email, database) {
  for (const userID in database) {
    const user = database[userID];

    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};


module.exports = { findUserByEmail, generateRandomString, urlsForUser };