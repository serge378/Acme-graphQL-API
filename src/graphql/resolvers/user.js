const { UserInputError, AuthenticationError } = require("apollo-server-core");
const {
  userDoesNotExit,
  gravatar,
  generateToken,
} = require("../../helpers/user");
const {
  validateSignUpInput,
  validateSignInInput,
} = require("../../helpers/validators");
const User = require("../../models/User");
const checkAuth = require("../../helpers/checkAuth");

require("dotenv").config();

module.exports = {
  Query: {
    user: async (parent, { username }, { user }) => {
      checkAuth(user);
      // find a user given their username
      return await User.findOne({ username });
    },
    users: async (parent, args, { user }) => {
      checkAuth(user);
      // find all users
      return await User.find({});
    },
    me: async (parent, args, { user }) => {
      checkAuth(user);
      // find a user given the current user context
      return await User.findById(user.id);
    },
  },
  Mutation: {
    signUp: async (
      parent,
      { registerInput: { username, email, password, confirmPassword } }
    ) => {
      const { valid, errors } = validateSignUpInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      //Make sure user doesn't exst
      await userDoesNotExit(username, email);

      //Create user a save it
      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
        avatar: gravatar(email),
      });

      const res = await newUser.save();

      const token = generateToken(res._id);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
    signIn: async (parent, { email, password }) => {
      const { valid, errors } = validateSignInInput(email, password);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({ email });

      if (!user) {
        errors.username = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      const martchedpassword = await user.validatePassword(password);
      if (!martchedpassword) {
        errors.password = "Wrong crendetials";
        throw new UserInputError("Wrong crendetials", { errors });
      }

      const token = generateToken(user._id);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
  },
};
