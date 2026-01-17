import db from '../models/index';
const HODAvailability = db.HODAvailability;
import { Request, Response } from 'express';

// GET HOD availability
export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { user } = req.body;
    const availability = await HODAvailability.findOne({ where: { hod_id: user.userId } });
    if (!availability) return res.status(404).json({ message: "HOD not found" });
    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: "Error fetching availability", error: (err as Error).message });
  }
};

// UPDATE HOD availability
export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const { is_available, status_message, estimated_return_time, userId } = req.body;

    const updated = await HODAvailability.update(
      { is_available, status_message, estimated_return_time, last_updated: new Date() },
      { where: { hod_id: userId } }
    );

    if (updated[0] === 0) return res.status(404).json({ message: "HOD not found" });

    res.json({ message: "Availability updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating availability", error: (err as Error).message });
  }
};
