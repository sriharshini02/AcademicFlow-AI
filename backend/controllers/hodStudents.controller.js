import db from "../models/index.js";

const {
  HODInfo,
  StudentCore,
  StudentAttendance,
  StudentAcademicScore,
  User,
  StudentPersonalInfo,
  StudentExtracurricular
} = db;

export const getHODStudents = async (req, res) => {
  try {
    const hodId = req.userId;
    const { year, section } = req.query; // <-- new filters

    if (!hodId) return res.status(400).json({ message: "Missing HOD ID" });

    const hodInfo = await HODInfo.findOne({
      where: { hod_id: hodId },
      raw: true,
    });

    if (!hodInfo)
      return res.status(404).json({ message: "No HODInfo found for given ID" });

    const department = hodInfo.department;

    // Build filter dynamically
    const filter = { department };
    if (year) filter.year_group = year;
    if (section) filter.section = section;

    const students = await StudentCore.findAll({
      where: filter,
      attributes: [
        "student_id",
        "full_name",
        "roll_number",
        "year_group",
        "section",
        "assigned_proctor_id",
      ],
      raw: true,
    });

    console.log(`✅ Found ${students.length} students for ${department} (${year || "All Years"} - ${section || "All Sections"})`);

    const result = await Promise.all(
      students.map(async (s) => {
        const attendanceRecord = await StudentAttendance.findOne({
          where: { student_id: s.student_id },
          order: [["createdAt", "DESC"]],
          attributes: ["attendance_percentage"],
          raw: true,
        });

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
          section: s.section || "N/A",
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

export const getHODStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await StudentCore.findOne({
      where: { student_id: id },
      include: [
        { model: StudentPersonalInfo, required: false }, // Fetches date_of_birth
        { model: StudentAcademicScore, required: false },
        { model: StudentAttendance, required: false },
        { model: StudentExtracurricular, required: false },
        { model: User, as: 'proctor', attributes: ['name'], required: false }
      ]
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Compute GPA
    const scores = student.student_academic_scores || [];
    const totalMarks = scores.reduce((sum, s) => sum + (s.total_marks || 0), 0);
    const gpa = scores.length ? (totalMarks / scores.length).toFixed(2) : "N/A";

    // Latest Attendance
    const latestAttendance = (student.student_attendances || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    const personal = student.student_personal_info || {};

    const response = {
      roll_number: student.roll_number,
      full_name: student.full_name,
      department: student.department,
      year_group: student.year_group,
      section: student.section || "N/A",
      
      // ✅ FIX: Map 'date_of_birth' from DB to 'dob' for frontend
      dob: personal.date_of_birth ? new Date(personal.date_of_birth).toLocaleDateString() : "N/A",
      
      gender: personal.gender || "N/A",
      phone: personal.phone_number || "N/A",
      email: personal.college_email || "N/A",
      personal_email: personal.personal_email || "N/A",
      father_name: personal.father_name || "N/A",
      mother_name: personal.mother_name || "N/A",
      father_phone: personal.father_phone || "N/A",
      mother_phone: personal.mother_phone || "N/A",
      
      gpa,
      total_marks: totalMarks,
      attendance_percentage: latestAttendance?.attendance_percentage || "N/A",
      proctor: student.proctor?.name || "N/A",
      
      academic_scores: scores.map((s) => ({
        semester: s.semester,
        subject_name: s.subject_name,
        total_marks: s.total_marks
      })),
      
      extracurriculars: (student.student_extracurriculars || []).map((e) => ({
        activity_name: e.activity_name,
        description: e.description,
        achievement_level: e.achievement_level,
        date: e.date
      }))
    };

    res.json(response);
  } catch (err) {
    console.error("❌ Error fetching student details:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};