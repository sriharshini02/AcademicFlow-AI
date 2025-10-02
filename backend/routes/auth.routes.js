import { signup, login } from '../controllers/auth.controller.js';
import express from 'express';

const router = express.Router();

export default (app) => {
    // Middleware to ensure CORS headers are set correctly for all auth routes
    app.use((req, res, next) => {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // POST /api/auth/signup - Route for user registration
    router.post("/signup", signup);

    // POST /api/auth/login - Route for user login
    router.post("/login", login);

    // Prefix all routes in this file with /api/auth
    app.use('/api/auth', router);
};
