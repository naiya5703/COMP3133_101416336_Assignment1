const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");  
const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");
require("dotenv").config();

const app = express();
app.use(express.json());  

// ✅ Function to start the server asynchronously
const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || "";
      if (token.startsWith("Bearer ")) {
        try {
          const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
          return { user: decoded };
        } catch (err) {
          throw new Error("Invalid token");
        }
      }
      return {}; // Return an empty object if no token is provided
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  // ✅ Connect to MongoDB Atlas
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${process.env.PORT}/graphql`);
  });
};

// ✅ Call the async function to start the server
startServer();
