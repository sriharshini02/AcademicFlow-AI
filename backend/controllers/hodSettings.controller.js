import { Controller, Get, Put, Middleware } from '@overnightjs/core';
import db from "../models/index.js";
import bcrypt from "bcryptjs";
import { verifyToken } from '../middleware/jwt-auth.middleware.js';

@Controller('api/hod')
export class HODSettingsController {
  @Get('/profile')
  @Middleware([verifyToken])
  async getHODProfile(req, res) {
    try {
      const userId = req.user.user_id; // from token middleware
      const hod = await db.User.findByPk(userId, {
        attributes: ["user_id", "name", "email", "role"],
        include: [
          {
            model: db.HODInfo,
            as: "hod_info",
            attributes: ["department", "office_room", "contact_number"],
          },
        ],
      });

      if (!hod) return res.status(404).json({ message: "HOD not found" });
      res.json(hod);
    } catch (err) {
      console.error("Error fetching HOD profile:", err);
      res.status(500).json({ message: "Failed to fetch HOD profile" });
    }
  }

  @Put('/profile')
  @Middleware([verifyToken])
  async updateHODProfile(req, res) {
    try {
      const userId = req.user.user_id;
      const { name, email, password, contact_number, office_room } = req.body;

      const hod = await db.User.findByPk(userId);
      if (!hod) return res.status(404).json({ message: "HOD not found" });

      // Update user fields
      if (name) hod.name = name;
      if (email) hod.email = email;
      if (password) {
        const hashed = await bcrypt.hash(password, 10);
        hod.password_hash = hashed;
      }
      await hod.save();

      // Update HOD info
      const hodInfo = await db.HODInfo.findOne({ where: { hod_id: userId } });
      if (hodInfo) {
        if (contact_number) hodInfo.contact_number = contact_number;
        if (office_room) hodInfo.office_room = office_room;
        await hodInfo.save();
      }

      res.json({ message: "Profile updated successfully" });
    } catch (err) {
      console.error("Error updating HOD profile:", err);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
}
