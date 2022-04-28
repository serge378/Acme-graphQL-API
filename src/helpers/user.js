const { UserInputError, AuthenticationError } = require("apollo-server-core");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const md5 = require("blueimp-md5");

module.exports.userDoesNotExit = async (username, email) => {
  //Make sure username doesnt already exist
  const userByUsername = await User.findOne({ username });
  if (userByUsername) {
    throw new UserInputError("Username is taken", {
      errors: {
        username: "This username is taken",
      },
    });
  }
  //Make sure email doesnt already exist
  const userByEmail = await User.findOne({ email });
  if (userByEmail) {
    throw new UserInputError("Username is taken", {
      errors: {
        email: "This email is taken",
      },
    });
  }
};

module.exports.getUser = async (token) => {
  if (token) {
    try {
      // return the user information from the token
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      return await User.findById(id);
    } catch (err) {
      // if there's a problem with the token, throw an error
      return null;
    }
  }
};

module.exports.gravatar = (email) => {
  const hashedAvatar = md5(email);
  return `https://www.gravatar.com/avatar/${hashedAvatar}`;
};

module.exports.generateToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
