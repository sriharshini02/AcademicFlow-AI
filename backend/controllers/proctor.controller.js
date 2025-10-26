// controllers/proctorController.js
import db from "../models/index.js";

const { User, StudentCore } = db;

// ✅ GET Proctor Profile
export const getProctorProfile = async (req, res) => {
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
};

// ✅ UPDATE Proctor Profile/Settings
export const updateProctorProfile = async (req, res) => {
  try {
    const proctorId = req.userId;
    const { name, email, password } = req.body;

    const proctor = await User.findByPk(proctorId, {
  include: [{ model: StudentCore, as: "student_cores" }]
});

    if (!proctor)
      return res.status(404).json({ message: "Proctor not found" });

    if (name) proctor.name = name;
    if (email) proctor.email = email;
    if (password) {
      // Add your bcrypt hashing logic here if needed
      proctor.password_hash = password;
    }

    await proctor.save();
    res.json({ message: "Profile updated successfully", proctor });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

export const getProctorStudents = async (req, res) => {
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
};
