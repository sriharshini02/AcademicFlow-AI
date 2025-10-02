import db from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables for the JWT secret key
dotenv.config();

const User = db.User;
const HODAvailability = db.HODAvailability;
// IMPORTANT: Replace 'YOUR_JWT_SECRET_KEY' with a long, complex, random string 
// in your .env file before production deployment.
const JWT_SECRET = process.env.JWT_SECRET || 'asdfghjkmnbvcxwertyuiovcxcvbn'; 

/**
 * Register a new user (HOD or Proctor).
 * @param {object} req - Request object containing user details (name, email, password, role).
 * @param {object} res - Response object.
 */
export const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Basic validation
        if (!name || !email || !password || !role) {
            return res.status(400).send({ message: "All fields (name, email, password, role) are required." });
        }
        
        // 2. Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Create the user
        const user = await User.create({
            name,
            email,
            password_hash: passwordHash,
            role,
        });

        // 4. Initialize HOD availability status if the new user is HOD
        if (role === 'HOD') {
            await HODAvailability.create({
                hod_id: user.user_id,
                is_available: false, // Default to unavailable upon creation
                status_message: 'HOD status not yet updated.',
            });
        }
        
        console.log(`User created: ${user.email} (${user.role})`);
        res.status(201).send({ 
            message: "User registered successfully!", 
            userId: user.user_id,
            role: user.role
        });

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).send({ message: "Error: Email already in use." });
        }
        console.error("Signup error:", error);
        res.status(500).send({ message: "Internal server error during signup." });
    }
};

/**
 * Log in an existing user and generate a JWT token.
 * @param {object} req - Request object containing email and password.
 * @param {object} res - Response object.
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).send({ message: "Authentication failed. User not found." });
        }

        // 2. Compare the submitted password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).send({ message: "Authentication failed. Invalid password." });
        }

        // 3. Generate JWT token, containing user ID and role for RBAC
        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' } // Token expires after 8 hours
        );

        // 4. Send token and user info back to the client
        res.status(200).send({
            message: "Login successful.",
            accessToken: token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({ message: "Internal server error during login." });
    }
};
