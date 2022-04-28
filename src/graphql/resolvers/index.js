const Note = require("../../models/Note");
const User = require("../../models/User");
const noteResolvers = require("./note");
const userResolvers = require("./user");

module.exports = {
  Note: {
    favoriteCount: (parent) => parent.favoritedBy.length,
    // Resolve the author info for a note when requested
    author: async (parent, args) => await User.findById(parent.author),
    // Resolved the favoritedBy info for a note when requested
    favoritedBy: async (parent, args) =>
      await User.find({ _id: { $in: parent.favoritedBy } }),
  },
  User: {
    favorites: async (parent, args) =>
      await Note.find({ favoritedBy: parent._id }).sort({ _id: -1 }),
    notes: async (parent, args) =>
      await Note.find({ author: parent._id }).sort({ _id: -1 }),
  },
  Query: {
    ...noteResolvers.Query,
    ...userResolvers.Query,
  },
  Mutation: {
    ...noteResolvers.Mutation,
    ...userResolvers.Mutation,
  },
};
