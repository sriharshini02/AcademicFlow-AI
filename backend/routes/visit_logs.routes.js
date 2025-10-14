import express from 'express';
import db from '../models/index.js';
import { verifyToken } from '../middleware/authJwt.js';

const router = express.Router();

// Get queued (new) appointments
router.get("/queued", verifyToken, async (req, res) => {
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
});

// Acknowledge queued requests (mark as Pending)
router.put("/acknowledge-new", verifyToken, async (req, res) => {
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
});

// Pending appointments
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

// Scheduled appointments
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

// Update appointment status
router.put('/:id/update-status', verifyToken, async (req, res) => {
  try {
    const { action_taken, scheduled_time, hod_notes } = req.body;
    const visit = await db.VisitLog.findByPk(req.params.id);
    if (!visit) return res.status(404).json({ message: 'Appointment not found' });

    const validTransitions = {
      Pending: ['Scheduled', 'Completed', 'Cancelled'],
      Scheduled: ['Completed', 'Cancelled'],
      Completed: [],
      Cancelled: [],
    };

    if (!validTransitions[visit.action_taken].includes(action_taken)) {
      return res.status(400).json({ message: `Cannot change ${visit.action_taken} to ${action_taken}` });
    }

    if (action_taken === 'Scheduled' && scheduled_time) visit.scheduled_time = scheduled_time;
    if (action_taken === 'Completed') {
      visit.status = 'CheckedIn';
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

export default router;
