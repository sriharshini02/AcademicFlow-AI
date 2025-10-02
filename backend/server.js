import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './models/index.js';
// Import the routes function
import authRoutes from './routes/auth.routes.js'; 

// Load environment variables from .env file
dotenv.config();

const app = express();

// Set up CORS options to allow requests from the React frontend
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware to parse requests of content-type - application/json
app.use(express.json());

// Middleware to parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


// --- Database Synchronization ---
// The { alter: true } option ensures Sequelize checks the current state 
// of the database and makes necessary changes (creates tables if they don't exist).
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database synced successfully. Tables are ready.");
    // Initial data seeding can go here if needed 
  })
  .catch((err) => {
    console.error("Failed to sync database:", err.message);
  });

// --- Simple Test Route ---
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Academic Dashboard API. Ready to build!" });
});

// --- Register Routes ---
// This registers all authentication routes
authRoutes(app); 


// Define the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}.`);
});

export default app;