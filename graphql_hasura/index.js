const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const app = express();
const port = process.env.PORT || 4000;

// Define your GraphQL schema using gql template literal
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Resolver functions for the defined schema
const resolvers = {
  Query: {
    hello: () => 'Hello, GraphQL!',
  },
};

// Create an Apollo Server and apply it to Express
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/graphql`);
});


