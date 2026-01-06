import { Server } from '@overnightjs/core';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './models/index.js';
import { responseMiddleware, errorHandler, notFoundHandler } from './middleware/response.middleware.js';

// Import all controllers
import { UserController } from './controllers/auth.controller.js';
import { TodoController } from './controllers/todo.controller.js';
import { HODAvailabilityController } from './controllers/hodAvailability.controller.js';
import { HODSettingsController } from './controllers/hodSettings.controller.js';
import { HODStudentsController } from './controllers/hodStudents.controller.js';
import { ProctorController } from './controllers/proctor.controller.js';
import { ProctorDashboardController } from './controllers/proctorDashboard.controller.js';
import { ProctorStudentController } from './controllers/proctorStudent.controller.js';
import { VisitLogsController } from './controllers/visitLogs.controller.js';

dotenv.config();

class AppServer extends Server {
  constructor() {
    super();
    this.setupMiddleware();
    this.setupControllers();
    this.setupDatabase();
  }

  setupMiddleware() {
    // CORS configuration
    this.app.use(cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true
    }));

    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Response middleware - Must be before routes
    this.app.use(responseMiddleware);

    // Request logging middleware
    this.app.use((req, _res, next) => {
      console.log("Incoming request:", req.method, req.url);
      console.log("Headers:", req.headers);
      next();
    });

    // CORS headers middleware for auth routes
    this.app.use((_req, res, next) => {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  }

  setupControllers() {
    // Register all controllers with OvernightJS
    super.addControllers([
      new UserController(),
      new TodoController(),
      new HODAvailabilityController(),
      new HODSettingsController(),
      new HODStudentsController(),
      new ProctorController(),
      new ProctorDashboardController(),
      new ProctorStudentController(),
      new VisitLogsController()
    ]);
  }

  setupDatabase() {
    db.sequelize.sync({ alter: true })
      .then(() => console.log("✅ Database synced successfully."))
      .catch(err => {
        const errorMessage = err?.message || err?.toString() || 'Unknown error';
        console.error("❌ Failed to sync database:", errorMessage);
      });
  }

  start(port) {
    // Root route
    this.app.get("/", (_req, res) => {
      res.success({ message: "Welcome to the Academic Dashboard API!" }, "API is running");
    });

    // 404 handler - Must be after all routes
    this.app.use(notFoundHandler);

    // Error handler - Must be last
    this.app.use(errorHandler);

    this.app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  }
}

const PORT = process.env.PORT || 5111;
const server = new AppServer();
server.start(PORT);
