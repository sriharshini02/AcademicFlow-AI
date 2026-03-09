import db from "../models/index.js";

export const createVisitLog = async (req, res) => {
    try {
    const { 
    visitor_name, 
    visitor_role, 
    related_student_id, 
    purpose, 
      scheduled_time // Send this if it's a future appointment, leave blank for live check-ins
    } = req.body;

    // 1. Validate required fields
    if (!visitor_name || !visitor_role || !purpose) {
    return res.status(400).json({ 
        error: "visitor_name, visitor_role, and purpose are required fields." 
    });
    }

    // 2. Insert data into visit_logs_history table
    const newVisit = await db.VisitLog.create({
    visitor_name,
    visitor_role,
    related_student_id: related_student_id || null,
    purpose,
    scheduled_time: scheduled_time || null,
    
      // Note: The fields below are handled automatically by your Sequelize model defaults!
      // check_in_time: Sequelize.NOW
      // status: 'Queued'
      // action_taken: 'Pending'
      // alert_sent: false
    });

    console.log(`🤖 Hardware Bot logged a new visit for: ${visitor_name}`);

    // 3. Return success
    return res.status(201).json({
    message: "Visit logged successfully",
    visit: newVisit
    });

    } catch (error) {
    console.error("❌ Error inserting visit log from hardware:", error);
    return res.status(500).json({ error: "Internal server error" });
    }
};