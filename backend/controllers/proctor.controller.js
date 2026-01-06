import { Controller, Get, Post, Put, Middleware } from '@overnightjs/core';
import db from "../models/index.js";
import bcrypt from "bcryptjs";
import { verifyToken } from "../middleware/jwt-auth.middleware.js";

const { User, StudentCore } = db;

@Controller('api/proctor')
export class ProctorController {
  @Get('/profile')
  @Middleware([verifyToken])
  async getProctorProfile(req, res) {
    try {
      const proctorId = req.userId; // Extracted by verifyToken middleware
      const proctor = await User.findByPk(proctorId, {
        include: [{ model: StudentCore, as: "student_cores" }]
      });

      if (!proctor)
        return res.status(404).json({ message: "Proctor not found" });

      res.json(proctor);
    } catch (err) {
      console.error("Error fetching proctor profile:", err);
      res.status(500).json({ message: "Server error fetching profile" });
    }
  }

  @Put('/settings/update')
  @Middleware([verifyToken])
  async updateProctorProfile(req, res) {
    try {
      const proctorId = req.userId; // Ensure this comes from your auth middleware
      const { name, email, password } = req.body;

      const proctor = await User.findByPk(proctorId, {
        include: [{ model: StudentCore, as: "student_cores" }]
      });

      if (!proctor)
        return res.status(404).json({ message: "Proctor not found" });

      // Update basic fields
      if (name) proctor.name = name;
      if (email) proctor.email = email;

      // ✅ FIX: Hash the password before saving
      if (password && password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        proctor.password_hash = await bcrypt.hash(password, salt);
      }

      await proctor.save();
      
      // Return success (excluding sensitive data)
      res.json({ 
        message: "Profile updated successfully", 
        proctor: {
          id: proctor.user_id,
          name: proctor.name,
          email: proctor.email
        }
      });

    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ message: "Error updating profile" });
    }
  }

  @Get('/students')
  @Middleware([verifyToken])
  async getProctorStudents(req, res) {
    try {
      const proctorId = req.userId;
      console.log("Proctor ID from token:", proctorId);  // 🔹 add this

      const students = await db.StudentCore.findAll({
        where: { assigned_proctor_id: proctorId },
        include: [
          { model: db.StudentPersonalInfo },
          { model: db.StudentAttendance },
          { model: db.StudentAcademicScore }
        ]
      });
      console.log("Students fetched:", students.length);  // 🔹 add this
      res.json(students);
    } catch (error) {
      console.error("Error fetching proctor students:", error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  }
}
