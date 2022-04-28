const { UserInputError, ForbiddenError } = require("apollo-server-core");
const { default: mongoose } = require("mongoose");
const checkAuth = require("../../helpers/checkAuth");
const { ValidateNoteContent } = require("../../helpers/validators");
const Note = require("../../models/Note");

module.exports = {
  Mutation: {
    createNote: async (parent, { content }, { user }) => {
      // if not a user, throw an Authentication Error
      checkAuth(user);

      const { errors, valid } = ValidateNoteContent(content);

      if (!valid) throw UserInputError("Errors", { errors });

      return await Note.create({
        content,
        // reference the author's mongo id
        author: mongoose.Types.ObjectId(user.id),
      });
    },
    deleteNote: async (parent, { id }, { user }) => {
      // if not a user, throw an Authentication Error
      checkAuth(user);

      // find the note
      const note = await Note.findById(id);
      // if the note owner and current user don't match, throw a forbidden error
      if (note && String(note.author) !== user.id) {
        throw new ForbiddenError(
          "You don't have permissions to delete the note"
        );
      }

      try {
        await note.remove();
        return true;
      } catch (error) {
        return false;
      }
    },
    updateNote: async (parent, { content, id }, { user }) => {
      // if not a user, throw an Authentication Error
      checkAuth(user);
      //Find the note
      const note = await Note.findById(id);
      // if the note owner and current user don't match, throw a forbidden error
      if (note && String(note.author) !== user.id) {
        throw new ForbiddenError(
          "You don't have permissions to update the note"
        );
      }

      note.content = content;

      return await note.save();
    },
    toggleFavorite: async (parent, { id }, { user }) => {
      // if not a user, throw an Authentication Error
      checkAuth(user);

      const note = await Note.findById(id);
      if (note) {
        if (note.favoritedBy.find((userId) => userId.equals(user.id))) {
          // Note already favorites, unfavorite it
          note.favoritedBy = note.favoritedBy.filter(
            (userId) => !userId.equals(user.id)
          );
        } else {
          // Not liked, like post
          note.favoritedBy.push(mongoose.Types.ObjectId(user.id));
        }

        await note.save();
        return note;
      } else {
        throw new UserInputError("Note not found");
      }
    },
  },
  Query: {
    note: async (parent, args) => {
      return await Note.findById(args.id);
    },
    notes: async (parent, args) => {
      return await Note.find().limit(100);
    },
    noteFeed: async (parent, { cursor }) => {
      // hardcode the limit to 10 items
      const limit = 3;
      // set the default hasNextPage value to false
      let hasNextPage = false;
      // if no cursor is passed the default query will be empty
      // this will pull the newest notes from the db
      let cursorQuery = {};
      // if there is a cursor
      // our query will look for notes with an ObjectId less than that of the cursor
      if (cursor) {
        cursorQuery = { _id: { $lt: cursor } };
      }
      // find the limit + 1 of notes in our db, sorted newest to oldest
      let notes = await Note.find(cursorQuery)
        .sort({ _id: -1 })
        .limit(limit + 1);
      // if the number of notes we find exceeds our limit
      // set hasNextPage to true and trim the notes to the limit
      if (notes.length > limit) {
        hasNextPage = true;
        notes = notes.slice(0, -1);
      }
      // the new cursor will be the Mongo object ID of the last item in the feed array
      const newCursor = notes[notes.length - 1]._id;
      return {
        notes,
        cursor: newCursor,
        hasNextPage,
      };
    },
  },
};
