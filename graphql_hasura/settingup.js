// Setting Up hasura server url and api key
// Import necessary packages
const { ApolloServer, gql } = require('apollo-server-express');
const axios = require('axios');

// Create a function to fetch data from Hasura
const queryHasura = async (query, variables) => {
  const response = await axios.post(
    HASURA_GRAPHQL_URL,
    {
      query,
      variables,
    },
    {
      headers: {
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
    }
  );
  return response.data;
};

// Define your GraphQL schema
const typeDefs = gql`
  type Query {
    hello: String
    getUser(id: Int!): User
  }

  type Mutation {
    addUser(name: String!, emailId: String!): User
    deleteUser(id: Int!): User
  }

  type User {
    id: Int!
    name: String
    emailId: String
  }
`;

// Resolver functions for the defined schema
const resolvers = {
  Query: {
    hello: () => 'Hello, GraphQL!',
    getUser: async (_, { id }) => {
      const query = `
        query GetUser($id: Int!) {
          user_by_pk(id: $id) {
            id
            name
            emailId
          }
        }
      `;
      const variables = { id };

      const { data } = await queryHasura(query, variables);
      return data.user_by_pk;
    },
  },
  Mutation: {
    addUser: async (_, { name, emailId }) => {
      const mutation = `
        mutation AddUser($name: String!, $emailId: String!) {
          insert_user_one(object: { name: $name, emailId: $emailId }) {
            id
            name
            emailId
          }
        }
      `;
      const variables = { name, emailId };

      const { data } = await queryHasura(mutation, variables);
      return data.insert_user_one;
    },
    deleteUser: async (_, { id }) => {
      const mutation = `
        mutation DeleteUser($id: Int!) {
          delete_user_by_pk(id: $id) {
            id
            name
            emailId
          }
        }
      `;
      const variables = { id };

      const { data } = await queryHasura(mutation, variables);
      return data.delete_user_by_pk;
    },
  },
};

// Create an Apollo Server and apply it to Express
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

// ...
