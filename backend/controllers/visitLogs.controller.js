import { Controller, Get, Put, Middleware } from '@overnightjs/core';
import db from '../models/index.js';
import { verifyToken } from '../middleware/jwt-auth.middleware.js';

@Controller('api/visit_logs')
export class VisitLogsController {
  // Get ALL appointments (any status)
  @Get('/')
  @Middleware([verifyToken])
  async getAllAppointments(req, res) {
    try {
      const visits = await db.VisitLog.findAll({
        include: [
          { model: db.StudentCore, as: "student", attributes: ["student_id", "full_name"] }
        ],
        order: [["check_in_time", "DESC"]],
      });
      res.json(visits);
    } catch (err) {
      console.error("Error fetching all appointments:", err);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  }

  // Get queued (new) appointments
  @Get('/queued')
  @Middleware([verifyToken])
  async getQueuedAppointments(req, res) {
    try {
      const visits = await db.VisitLog.findAll({
        where: { status: "Queued" },
        include: [
          { model: db.StudentCore, as: "student", attributes: ["student_id", "full_name"] }
        ],
        order: [["check_in_time", "ASC"]],
      });
      res.json(visits);
    } catch (err) {
      console.error("Error fetching queued visits:", err);
      res.status(500).json({ message: "Failed to fetch queued visits" });
    }
  }

  // Acknowledge queued requests (mark as Pending)
  @Put('/acknowledge-new')
  @Middleware([verifyToken])
  async acknowledgeNewRequests(req, res) {
    try {
      const [updatedCount] = await db.VisitLog.update(
        { status: "Pending" },
        { where: { status: "Queued" } }
      );
      res.json({ message: `${updatedCount} new requests acknowledged.` });
    } catch (err) {
      console.error("Error updating queued requests:", err);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  }

  // Pending appointments
  @Get('/pending')
  @Middleware([verifyToken])
  async getPendingAppointments(req, res) {
    try {
      const visits = await db.VisitLog.findAll({
        where: { action_taken: 'Pending' },
        include: [{ model: db.StudentCore, as: 'student', attributes: ['student_id', 'full_name'] }],
        order: [['check_in_time', 'ASC']],
      });
      res.json(visits);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching pending visits', error: err.message });
    }
  }

  // Scheduled appointments
  @Get('/scheduled')
  @Middleware([verifyToken])
  async getScheduledAppointments(req, res) {
    try {
      const visits = await db.VisitLog.findAll({
        where: { action_taken: 'Scheduled' },
        include: [{ model: db.StudentCore, as: 'student', attributes: ['student_id', 'full_name'] }],
        order: [['scheduled_time', 'ASC']],
      });
      res.json(visits);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching scheduled visits', error: err.message });
    }
  }

  // Update appointment status
  @Put('/:id/update-status')
  @Middleware([verifyToken])
  async updateAppointmentStatus(req, res) {
    try {
      const { action_taken, scheduled_time, hod_notes } = req.body;
      const visit = await db.VisitLog.findByPk(req.params.id);

      if (!visit) return res.status(404).json({ message: 'Appointment not found' });

      // Handle undefined or null states gracefully
      const currentState = visit.action_taken || visit.status || 'Pending';

      const validTransitions = {
        Pending: ['Scheduled', 'Completed', 'Cancelled'],
        Scheduled: ['Scheduled','Completed', 'Cancelled'],
        Completed: [],
        Cancelled: [],
      };

      const allowedNext = validTransitions[currentState] || ['Scheduled', 'Completed', 'Cancelled'];

      if (!allowedNext.includes(action_taken)) {
        return res.status(400).json({
          message: `Cannot change ${currentState} to ${action_taken}`,
        });
      }

      // Handle Scheduled
      if (action_taken === 'Scheduled' && scheduled_time) {
        const localTime = new Date(scheduled_time);
        // Adjust to IST (UTC+5:30)
        const istOffsetMs = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(localTime.getTime() + istOffsetMs);

        // Format for MySQL DATETIME (YYYY-MM-DD HH:mm:ss)
        const formatted = istDate.toISOString().slice(0, 19).replace('T', ' ');
        visit.scheduled_time = formatted;
      }

      // Handle Completed
      if (action_taken === 'Completed') {
        visit.status = 'CheckedIn';
        visit.end_time = new Date();
        if (hod_notes) visit.hod_notes = hod_notes;
      }

      visit.action_taken = action_taken;
      await visit.save();

      res.json({ message: 'Appointment updated successfully', visit });
    } catch (err) {
      console.error('Error updating appointment:', err);
      res.status(500).json({ message: 'Failed to update appointment', error: err.message });
    }
  }

  // GET /api/visit_logs/history
  @Get('/history')
  async getHistory(req, res) {
    try {
      const history = await db.VisitLog.findAll({
        where: { action_taken: 'Completed' },
        include: [{ model: db.StudentCore, as: 'student' }],
        order: [['check_in_time', 'DESC']],
      });
      res.json(history);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch history' });
    }
  }
}

