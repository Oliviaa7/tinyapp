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

module.exports = { findUserByEmail };