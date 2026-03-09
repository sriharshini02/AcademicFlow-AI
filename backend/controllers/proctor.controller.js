import db from "../models/index.js";
import bcrypt from "bcryptjs";

const {
  User,
  StudentCore,
  StudentPersonalInfo,
  StudentAttendance,
  StudentAcademicScore,
  StudentExtracurricular
} = db;

// =========================================================
// 1. PROCTOR PROFILE & SETTINGS
// =========================================================

export const getProctorProfile = async (req, res) => {
  try {
    const proctorId = req.userId;
    const proctor = await User.findByPk(proctorId, {
      attributes: ['user_id', 'name', 'email', 'role', 'created_at'], 
      include: [{ model: StudentCore }] 
    });
    if (!proctor) return res.status(404).json({ message: "Proctor not found" });
    res.json(proctor);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProctorProfile = async (req, res) => {
  try {
    const proctorId = req.userId;
    const { name, email, password } = req.body;
    const proctor = await User.findByPk(proctorId);
    
    if (name) proctor.name = name;
    if (email) proctor.email = email;
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      proctor.password_hash = await bcrypt.hash(password, salt);
    }
    await proctor.save();
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating" });
  }
};

// =========================================================
// 2. STUDENT MANAGEMENT (List, Add, Update)
// =========================================================

// ✅ GET All Students + Proctor Tasks
export const getProctorStudents = async (req, res) => {
  try {
    const proctorId = req.userId;

    // 1. Fetch Students
    const students = await db.StudentCore.findAll({
      where: { assigned_proctor_id: proctorId },
      include: [
        { model: db.StudentPersonalInfo }, 
        { model: db.StudentAttendance }, 
        { model: db.StudentAcademicScore }
      ],
      order: [['roll_number', 'ASC']]
    });

    // 2. Fetch Tasks for this Proctor
    const tasks = await db.ToDoTask.findAll({
      where: { user_id: proctorId },
      order: [
        ['is_completed', 'ASC'], // Pending tasks first
        ['createdAt', 'DESC']    // Newest first
      ]
    });

    res.json({ students, tasks });
  } catch (error) {
    console.error("Error fetching proctor dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

// ✅ ADD a New Task
export const addTask = async (req, res) => {
  try {
    const { title, due_date, priority } = req.body;
    
    const newTask = await db.ToDoTask.create({
      user_id: req.userId,
      title,
      due_date: due_date || null,
      priority: priority || 'medium',
      is_completed: false
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
};

// ✅ TOGGLE Task Completion
export const toggleTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { is_completed } = req.body;

    const task = await db.ToDoTask.findOne({
      where: { task_id: taskId, user_id: req.userId }
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    task.is_completed = is_completed;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Error toggling task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

// ✅ ADD New Student (Moved from old file)
export const addStudent = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const proctorId = req.userId;
    const { roll_number, full_name, year_group, department, admission_type, personal_info } = req.body;

    const student = await StudentCore.create({
      roll_number, full_name, year_group, department, admission_type, assigned_proctor_id: proctorId
    }, { transaction: t });

    if (personal_info) {
      await StudentPersonalInfo.create({
        ...personal_info, student_id: student.student_id
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: "Student added successfully", student });
  } catch (error) {
    await t.rollback();
    console.error("❌ Error adding student:", error);
    res.status(500).json({ error: "Failed to add student" });
  }
};

// ✅ UPDATE Student (Moved from old file)
export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { full_name, year_group, department, admission_type, personal_info } = req.body;
  const t = await db.sequelize.transaction();

  try {
    const student = await StudentCore.findByPk(id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    await student.update({ full_name, year_group, department, admission_type }, { transaction: t });

    if (personal_info) {
      const personal = await StudentPersonalInfo.findOne({ where: { student_id: id } });
      if (personal) {
        await personal.update(personal_info, { transaction: t });
      } else {
        await StudentPersonalInfo.create({ ...personal_info, student_id: id }, { transaction: t });
      }
    }

    await t.commit();
    res.json({ message: "Student updated successfully" });
  } catch (error) {
    await t.rollback();
    console.error("❌ Error updating student:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
};

// =========================================================
// 3. STUDENT DETAILS (The Safe Version)
// =========================================================

// 📂 backend/controllers/proctor.controller.js

export const getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params; 
    console.log(`🔍 Fetching SAFE details for Student ID: ${id}`);

    const includeOptions = [
      { model: StudentPersonalInfo, required: false },
      { model: StudentAttendance, required: false },
      { model: StudentAcademicScore, required: false },
      { model: StudentExtracurricular, required: false },
      { model: User, as: 'proctor', attributes: ['name'], required: false }
    ];

    const student = await StudentCore.findOne({
      where: { student_id: id },
      include: includeOptions
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    // ✅ FIX 1: Correct CGPA Calculation (Use grade_points)
    const scores = student.student_academic_scores || [];
    
    // Sum up points (check grade_points first, fallback to total_marks)
    const totalPoints = scores.reduce((sum, s) => sum + (parseFloat(s.grade_points || s.total_marks) || 0), 0);
    
    // Calculate Average
    let calculatedGPA = scores.length ? (totalPoints / scores.length) : 0;
    
    // Normalize: If GPA > 10 (e.g. 75), convert to 10-scale (7.5)
    if (calculatedGPA > 10) calculatedGPA = calculatedGPA / 10;

    const gpa = calculatedGPA > 0 ? calculatedGPA.toFixed(2) : "N/A";

    // Attendance
    const latestAttendance = (student.student_attendances || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const personal = student.student_personal_info || {};
    const extracurriculars = student.student_extracurriculars || [];

    res.json({
      student_id: student.student_id,
      roll_number: student.roll_number,
      full_name: student.full_name,
      department: student.department,
      year: student.year_group,
      section: student.section || "N/A",
      proctor: student.proctor ? student.proctor.name : "Unassigned",
      email: personal.college_email || "-",
      phone: personal.phone_number || "-",
      father_name: personal.father_name || "-",
      address: personal.address || "-",
      
      gpa, // ✅ Now sends the correct GPA
      attendance_percentage: latestAttendance?.attendance_percentage || "0",
      
      // ✅ FIX 2: Send grade_points to frontend
      academic_scores: scores.map(s => ({ 
          id: s.id, 
          semester: s.semester, 
          grade_points: s.grade_points, // Added this field
          marks: s.total_marks 
      })),
      
      extracurriculars: extracurriculars.map(e => ({ id: e.id, activity: e.activity_name, level: e.achievement_level, date: e.date }))
    });

  } catch (err) {
    console.error("❌ CRITICAL ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};