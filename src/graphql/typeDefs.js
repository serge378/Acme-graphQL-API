const { gql } = require("apollo-server-express");

module.exports = gql`
  type Note {
    id: ID!
    content: String!
    author: User!
    createdAt: String!
    updatedAt: String!
    favoriteCount: Int!
    favoritedBy: [User!]!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    token: String!
    createdAt: String!
    updatedAt: String!
    notes: [Note!]!
    favorites: [Note!]!
  }

  type NoteFeed {
    notes: [Note]!
    cursor: String!
    hasNextPage: Boolean!
  }

  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }

  type Query {
    notes: [Note!]!
    note(id: ID): Note!
    me: User!
    user(username: String!): User!
    users: [User!]!
    noteFeed(cursor: String): NoteFeed
  }

  type Mutation {
    createNote(content: String!): Note!
    updateNote(id: ID!, content: String!): Note!
    deleteNote(id: ID!): Boolean!
    signUp(registerInput: RegisterInput): User!
    signIn(email: String!, password: String!): User!
    toggleFavorite(id: ID!): Note!
  }
`;
