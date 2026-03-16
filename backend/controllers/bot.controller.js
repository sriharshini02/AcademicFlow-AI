import db from "../models/index.js";

export const createVisitLog = async (req, res) => {
  try {
    const { role, name, contact, student_id, purpose } = req.body;

    // 1. Validate required base fields (Everyone must provide these)
    if (!role || !name || !contact || !purpose) {
      return res.status(400).json({ error: "Role, Name, Contact, and Purpose are required." });
    }

    // 2. Role-specific validation for Student ID
    let parsedStudentId = null;
    const normalizedRole = role.toLowerCase();

    if (normalizedRole === 'parent' || normalizedRole === 'student') {
        if (!student_id) {
            return res.status(400).json({ error: "Student ID / Roll Number is required for Parents and Students." });
        }
        parsedStudentId = parseInt(student_id);
    } 
    // If role is 'faculty', parsedStudentId safely remains null!

    // 3. Check HOD Availability (Assuming HOD ID 1)
    const hodStatus = await db.HODAvailability.findOne({ where: { hod_id: 1 } });
    const isAvailable = hodStatus ? hodStatus.is_available : false;
    const estTime = hodStatus ? hodStatus.estimated_return_time : null;
    const statusMsg = hodStatus ? hodStatus.status_message : "Currently unavailable";

    // 4. Create the Visit Log
    const newVisit = await db.VisitLog.create({
      visitor_name: name,
      visitor_role: role,
      contact_number: contact,           // ✅ Saved cleanly in its own column
      related_student_id: parsedStudentId, // ✅ Null for faculty, Integer for others
      purpose: purpose,
      status: 'Queued', 
      action_taken: 'Pending',
      alert_sent: false
    });

    console.log(`📠 Kiosk Entry: ${name} (${role}) - HOD Available: ${isAvailable}`);

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