const { AuthenticationError } = require("apollo-server-core");

module.exports = (user) => {
  if (!user) {
    throw new AuthenticationError("You must be signed to do this action");
  }
};
