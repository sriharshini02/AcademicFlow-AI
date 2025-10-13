import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './models/index.js';

import authRoutes from './routes/auth.routes.js';
import hodAvailabilityRoutes from './routes/hodAvailability.routes.js';
import todoRoutes from './routes/todo.js';
import visitLogsRoutes from './routes/visit_logs.routes.js';


dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  console.log("Headers:", req.headers);
  next();
});


authRoutes(app);  
app.use('/api/todo', todoRoutes);
app.use('/api/visit_logs', visitLogsRoutes);

db.sequelize.sync({ alter: true })
  .then(() => console.log("✅ Database synced successfully."))
  .catch(err => console.error("❌ Failed to sync database:", err.message));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Academic Dashboard API!" });
});

// Auth routes
authRoutes(app);

// HOD availability routes (now require token)
app.use('/api/hod/availability', hodAvailabilityRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
