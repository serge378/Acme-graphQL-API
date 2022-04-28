const helmet = require("helmet");
const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const depthLimit = require("graphql-depth-limit");
const { createComplexityLimitRule } = require("graphql-validation-complexity");
require("dotenv").config();

//Graphql Types and resolvers
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { getUser } = require("./helpers/user");

async function startApolloServer(typeDefs, resolvers) {
  //Env variables
  const PORT = process.env.PORT;
  const MONGODB_HOST = process.env.DB_HOST;
  const app = express();
  app.use(helmet());
  app.use(cors());
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(3), createComplexityLimitRule(1000)],
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: async ({ req }) => {
      const token = req.headers.authorization || "";

      // Try to retrieve a user with the token
      const user = await getUser(token);

      // Add the user to the context
      return { user };
    },
    introspection: process.env.NODE_ENV !== "production",
  });
  try {
    mongoose.connect(MONGODB_HOST, { useNewUrlParser: true });
    console.log("MongoDB Connected");
    await server.start();
    server.applyMiddleware({ app, path: "/api" });
    await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  } catch (error) {
    console.error(error);
  }
}

startApolloServer(typeDefs, resolvers);
