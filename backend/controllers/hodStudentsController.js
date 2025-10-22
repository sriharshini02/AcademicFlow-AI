import db from "../models/index.js";

const {
  HODInfo,
  StudentCore,
  StudentAttendance,
  StudentAcademicScore,
  User
} = db;

export const getHODStudents = async (req, res) => {
  try {
    const hodId = req.userId;
    console.log("📩 Incoming HOD ID:", hodId);

    if (!hodId) return res.status(400).json({ message: "Missing HOD ID" });

    const hodInfo = await HODInfo.findOne({
      where: { hod_id: hodId },
      raw: true,
    });

    if (!hodInfo)
      return res.status(404).json({ message: "No HODInfo found for given ID" });

    const department = hodInfo.department;

    // ✅ FIXED: Use full_name instead of student_name
    const students = await StudentCore.findAll({
      where: { department },
      attributes: ["student_id", "full_name", "roll_number", "year_group", "assigned_proctor_id"],
      raw: true,
    });

    console.log(`✅ Found ${students.length} students for department ${department}`);

    const result = await Promise.all(
      students.map(async (s) => {
        // Latest attendance record
        const attendanceRecord = await StudentAttendance.findOne({
          where: { student_id: s.student_id },
          order: [["createdAt", "DESC"]],
          attributes: ["attendance_percentage"],
          raw: true,
        });

        // Average GPA
        const scores = await StudentAcademicScore.findAll({
          where: { student_id: s.student_id },
          attributes: ["total_marks"],
          raw: true,
        });

        const avgGPA = scores.length
          ? (
              scores.reduce((sum, sc) => sum + parseFloat(sc.total_marks || 0), 0) /
              scores.length
            ).toFixed(2)
          : "N/A";

        // Proctor name
        let proctorName = "N/A";
        if (s.assigned_proctor_id) {
          const proctor = await User.findOne({
            where: { user_id: s.assigned_proctor_id },
            attributes: ["name"],
            raw: true,
          });
          proctorName = proctor ? proctor.name : "N/A";
        }

        return {
          id: s.student_id,
          rollNumber: s.roll_number,
          name: s.full_name,
          year: s.year_group,
          attendance: attendanceRecord ? attendanceRecord.attendance_percentage : "N/A",
          gpa: avgGPA,
          proctor: proctorName,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("Error fetching HOD students:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


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

