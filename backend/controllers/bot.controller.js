import db from "../models/index.js";

export const createVisitLog = async (req, res) => {
  try {
    const { role, name, contact, student_id, purpose } = req.body;

    // 1. Validate required base fields
    if (!role || !name || !contact || !purpose) {
      return res.status(400).json({ error: "Role, Name, Contact, and Purpose are required." });
    }

    let studentRoll = null;
    const normalizedRole = role.toLowerCase();

    // 2. Just take the Roll Number exactly as they typed it!
    if (normalizedRole === 'parent' || normalizedRole === 'student') {
        if (!student_id) {
            return res.status(400).json({ error: "Student Roll Number is required for Parents and Students." });
        }
        
        // Clean up the string and make it uppercase, but DO NOT verify it against the DB
        studentRoll = String(student_id).trim().toUpperCase();
    } 

    // 3. Check HOD Availability (Assuming HOD ID 2)
    const hodStatus = await db.HODAvailability.findOne({ where: { hod_id: 2 } });
    const isAvailable = hodStatus ? hodStatus.is_available : false;
    const estTime = hodStatus ? hodStatus.estimated_return_time : null;
    const statusMsg = hodStatus ? hodStatus.status_message : "Currently unavailable";

    // 4. Create the Visit Log with whatever Roll Number they gave us
    const newVisit = await db.VisitLog.create({
      visitor_name: name,
      visitor_role: role,
      contact_number: contact,           
      related_student_roll: studentRoll, // ✅ Saves fake, wrong, or real IDs equally!
      purpose: purpose,
      status: 'Queued', 
      action_taken: 'Pending',
      alert_sent: false
    });

    console.log(`📠 Kiosk Entry: ${name} (${role}) - Roll: ${studentRoll}`);

    // 5. Send response to Kiosk
    return res.status(201).json({
      message: "Visit logged successfully",
      hod_available: isAvailable,
      status_message: statusMsg,
      estimated_return_time: estTime,
      visit_id: newVisit.visit_id
    });

  } catch (error) {
    console.error("❌ Error processing kiosk visit:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getKioskHODStatus = async (req, res) => {
  try {
    const availability = await db.HODAvailability.findOne({ where: { hod_id: 2 } });
    
    if (!availability) {
      return res.json({ 
        is_available: false, 
        status_message: "Status unavailable", 
        estimated_return_time: null 
      });
    }

    res.json({
      is_available: availability.is_available,
      status_message: availability.status_message,
      estimated_return_time: availability.estimated_return_time
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching availability" });
  }
};