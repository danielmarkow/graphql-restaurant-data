import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { restaurants } from "./restaurants.js";

const typeDefs = `
type Query{
    restaurant(id: Int): restaurant
    restaurants: [restaurant]
  },
  type restaurant {
    id: Int
    name: String
    description: String
    dishes:[Dish]
  }
  type Dish{
    name: String
    price: Int
  }
  input restaurantInput{
    name: String
    description: String
  }
  type DeleteResponse{
    ok: Boolean!
  }
  type Mutation{
    setrestaurant(input: restaurantInput): restaurant
    deleterestaurant(id: Int!): DeleteResponse
    editrestaurant(id: Int!, name: String!): restaurant
  }
  `;

const resolvers = {
  Query: {
    restaurant: (parent, args, context, info) => {
      return restaurants.find((restaurant) => restaurant.id === args.id);
    },
    restaurants: (parent, args, context, info) => restaurants,
  },
  Mutation: {
    setrestaurant: (parent, args, context, info) => {
      // generate id
      let existingIds = [];
      restaurants.forEach((rest) => existingIds.push(rest.id));
      let newId = Math.max(...existingIds) + 1;

      // append to exiting restaurant array
      const newResto = {
        id: newId,
        name: args.input.name,
        description: args.input.description,
      };
      restaurants.push(newResto);
      return newResto;
    },
    deleterestaurant: (parent, args, context, info) => {
      restaurants.filter((resto) => resto.id !== args.id);
      return {
        ok: true,
      };
    },
    editrestaurant: (parent, args, context, info) => {
      const restoIndexInArr = restaurants.findIndex(
        (resto) => resto.id === args.id
      );

      const restoToEdit = restaurants[restoIndexInArr];

      if (restoIndexInArr > -1 && restoToEdit) {
        restoToEdit.name = args.name;
        restaurants[restoIndexInArr] = restoToEdit;
      }

      return restoToEdit;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
