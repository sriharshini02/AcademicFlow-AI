import { Controller, Get, Put, Middleware } from '@overnightjs/core';
import db from '../models/index.js';
import { verifyToken } from '../middleware/jwt-auth.middleware.js';

const HODAvailability = db.HODAvailability;

@Controller('api/hod/availability')
export class HODAvailabilityController {
  @Get('/')
  @Middleware([verifyToken])
  async getAvailability(req, res) {
    try {
      const availability = await HODAvailability.findOne({ where: { hod_id: req.userId } });
      if (!availability) return res.status(404).json({ message: "HOD not found" });
      res.json(availability);
    } catch (err) {
      res.status(500).json({ message: "Error fetching availability", error: err.message });
    }
  }

  @Put('/')
  @Middleware([verifyToken])
  async updateAvailability(req, res) {
    try {
      const { is_available, status_message, estimated_return_time } = req.body;

      const updated = await HODAvailability.update(
        { is_available, status_message, estimated_return_time, last_updated: new Date() },
        { where: { hod_id: req.userId } }
      );

      if (updated[0] === 0) return res.status(404).json({ message: "HOD not found" });

      res.json({ message: "Availability updated successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error updating availability", error: err.message });
    }
  }
}
