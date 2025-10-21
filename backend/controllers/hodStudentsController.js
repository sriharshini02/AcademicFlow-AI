// controllers/hodStudentsController.js
import db from "../models/index.js";

const { HODInfo, StudentCore } = db;

export const getStudentsByDepartment = async (req, res) => {
  try {
    // NOTE: middleware should set req.userId. If not present, we fallback to undefined.
    const hodId = req.userId;
    console.log("getStudentsByDepartment called. req.userId:", hodId);

    let whereClause = {};
    if (hodId) {
      const hod = await HODInfo.findOne({ where: { hod_id: hodId }, raw: true });
      console.log("HOD record:", hod);
      if (hod && hod.department) {
        whereClause.department = hod.department;
        console.log("Filtering students by department:", hod.department);
      } else {
        console.log("HOD found but no department set — returning all students' names");
      }
    } else {
      console.log("No hodId on request — returning all students' names (fallback)");
    }

    // Fetch only full_name field (and use raw:true for simple objects)
    const students = await StudentCore.findAll({
      where: whereClause,
      attributes: ["full_name"],
      raw: true,
    });

    console.log("Student rows fetched (raw):", students.length, students.slice(0,5));

    // Map to array of names
    const names = students.map((r) => r.full_name);

    console.log("Returning student names:", names.slice(0, 10));
    return res.json(names);
  } catch (err) {
    console.error("Error in getStudentsByDepartment:", err);
    return res.status(500).json({ message: "Server error" });
  }
};




export const getStudentById = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const student = await StudentCore.findOne({
      where: { student_id: studentId },
      include: [
        { model: StudentPersonalInfo },
        { model: StudentAcademicScore },
        { model: StudentAttendance },
        { model: StudentExtracurricular }
      ]
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    // Format for frontend
    const response = {
      student_id: student.student_id,
      name: student.full_name,
      roll_no: student.roll_number,
      department: student.department,
      phone: student.student_personal_info?.phone_number || "-",
      academicResults: student.student_academic_scores?.map(a => ({
        id: a.id,
        semester: a.semester,
        subject_name: a.subject_name,
        gpa: a.total_marks
      })),
      attendance: student.student_attendances?.map(a => ({
        id: a.id,
        month: a.month,
        percentage: a.attendance_percentage
      })),
      activities: student.student_extracurriculars?.map(act => ({
        id: act.id,
        activity_name: act.activity_name,
        year: act.date?.getFullYear() || "-"
      }))
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Server error" });
  }
};
