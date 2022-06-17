const getUser = (email, usersDatabase) => {
  for (let user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return usersDatabase[user];
    }
  }
  return false;
};

module.exports = { getUser }

