const { ApolloServer, gql } = require('apollo-server');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Charger le proto gRPC
const PROTO_PATH = path.join(__dirname, '../../proto/review.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true // important pour garder book_id intact
});
const reviewProto = grpc.loadPackageDefinition(packageDefinition).review;

// Créer le client gRPC
const client = new reviewProto.ReviewService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Définir le schéma GraphQL
const typeDefs = gql`
  type Review {
    user_id: String
    username: String
    content: String
    rating: Int
    created_at: String
  }

  type ReviewResponse {
    status: String
    message: String
  }

  type Query {
    reviews(bookId: String!): [Review]
  }

  type Mutation {
    addReview(
      book_id: String!
      user_id: String!
      username: String!
      content: String!
      rating: Int!
    ): ReviewResponse
  }
`;

// Définir les resolvers
const resolvers = {
  Query: {
    reviews: (_, { bookId }) => {
      return new Promise((resolve, reject) => {
        client.GetReviewsByBook({ book_id: bookId }, (err, response) => {
          if (err) {
            console.error('gRPC error:', err);
            reject(err);
          } else {
            resolve(response.reviews);
          }
        });
      });
    }
  },
  Mutation: {
    addReview: (_, args) => {
      return new Promise((resolve, reject) => {
        client.AddReview(args, (err, response) => {
          if (err) {
            console.error('gRPC error:', err);
            reject(err);
          } else {
            resolve(response);
          }
        });
      });
    }
  }
};

// Lancer le serveur Apollo
const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 GraphQL server ready at ${url}`);
});
