const getUser = (email, usersDatabase) => {
  for (let user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return usersDatabase[user];
    }
  }
  return false;
};

const generateRandomString = (length = 6) => {
  return Math.random().toString(20).substr(2, length);
};


const urlsForUser = (id, urlDatabase) => {
  let userURLs = {}
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = { ...urlDatabase[shortURL] }
      }
    }
  return userURLs
}
module.exports = { getUser, generateRandomString, urlsForUser }

