import express from 'express';
import cors from 'cors';
import db from './models/index';

import authRoutes from './routes/auth.routes';
import hodAvailabilityRoutes from './routes/hod-availability.routes';
import todoRoutes from './routes/todo.routes';
import visitLogsRoutes from './routes/visit-logs.routes';
import hodStudentsRoutes from "./routes/hod-students.routes";
import hodSettingsRoutes from "./routes/hod-settings.routes";
import proctorRoutes from "./routes/proctor.routes";
import { CLIENT_ORIGIN } from './config/env.config';
import { PORT } from './config/env.config';

const app = express();

app.use(cors({
  origin: CLIENT_ORIGIN || "http://localhost:3000",
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

app.use('/api/hod/students', hodStudentsRoutes);

db.sequelize.sync({ alter: true })
  .then(() => console.log("✅ Database synced successfully."))
  .catch((err: any) => console.error("❌ Failed to sync database:", err.message));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Academic Dashboard API!" });
});

// Auth routes
authRoutes(app);

// HOD availability routes (now require token)
app.use('/api/hod/availability', hodAvailabilityRoutes);

app.use("/api/hod", hodSettingsRoutes);


app.use("/api/proctor", proctorRoutes);
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
