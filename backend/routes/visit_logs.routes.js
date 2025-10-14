import express from 'express';
import db from '../models/index.js';
import { verifyToken } from '../middleware/authJwt.js';

const router = express.Router();

// Get pending appointments
router.get('/pending', verifyToken, async (req, res) => {
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
});

// Get scheduled appointments
router.get('/scheduled', verifyToken, async (req, res) => {
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
});

// Update appointment status/action
router.put('/:id/update-status', verifyToken, async (req, res) => {
  try {
    const { action_taken, scheduled_time, hod_notes } = req.body;

    const visit = await db.VisitLog.findByPk(req.params.id);
    if (!visit) return res.status(404).json({ message: 'Appointment not found' });

    // Valid transitions
    const validTransitions = {
      Pending: ['Scheduled', 'Completed', 'Cancelled'],
      Scheduled: ['Completed', 'Cancelled'],
      Completed: [],
      Cancelled: [],
    };

    if (!validTransitions[visit.action_taken].includes(action_taken)) {
      return res.status(400).json({ message: `Cannot change ${visit.action_taken} to ${action_taken}` });
    }

    // Update fields
    if (action_taken === 'Scheduled' && scheduled_time) visit.scheduled_time = scheduled_time;
    if (action_taken === 'Completed') {
      visit.end_time = new Date();
      if (hod_notes) visit.hod_notes = hod_notes;
    }
    visit.action_taken = action_taken;

    await visit.save();
    res.json({ message: 'Appointment updated successfully', visit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update appointment', error: err.message });
  }
});

// Get count of new visitors (Pending)
router.get("/new-visitors", verifyToken, async (req, res) => {
  try {
    const count = await db.VisitLog.count({
      where: { action_taken: "Pending" },
    });
    res.json({ count });
  } catch (err) {
    console.error("Error fetching new visitors:", err);
    res.status(500).json({ message: "Failed to fetch new visitors" });
  }
});


export default router;
