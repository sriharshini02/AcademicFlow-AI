import db from "../models/index.js";

export const getProctorDashboardData = async (req, res) => {
  try {
    const proctorId = req.userId; // Assuming middleware sets userId, double-check if it's req.user.user_id

    // Fetch students assigned to this proctor
    const students = await db.StudentCore.findAll({
      where: { assigned_proctor_id: proctorId },
      include: [
        { model: db.StudentAttendance, limit: 1, order: [["createdAt", "DESC"]] }, // Get latest attendance
        { model: db.StudentAcademicScore },
      ],
    });

    const totalStudents = students.length;

    // 1. Compute Class Average Attendance
    // Logic: Average of the latest attendance percentage of all students
    const attendanceValues = students
      .map(s => {
        const latestAtt = s.student_attendances?.[0]; // Get the single latest record
        return latestAtt ? parseFloat(latestAtt.attendance_percentage) : null;
      })
      .filter(val => val !== null); // Remove nulls

    const avgAttendance =
      attendanceValues.length > 0
        ? (attendanceValues.reduce((a, b) => a + b, 0) / attendanceValues.length).toFixed(1)
        : "0.0";


    // 2. Compute Class Average CGPA
    // Logic: Calculate individual CGPA for each student, then average them all.
    let totalCGPA = 0;
    let studentCountWithGrades = 0;
    let lowPerformanceCount = 0;

    students.forEach(s => {
      const scores = s.student_academic_scores || [];
      if (scores.length > 0) {
        // A. Calculate this student's CGPA
        // Sum of all (grade_points or total_marks) / number of subjects
        // Adjust logic if you have credits: Sum(credits * points) / Sum(credits)
        const totalPoints = scores.reduce((sum, score) => sum + (parseFloat(score.grade_points || score.total_marks) || 0), 0);
        const studentCGPA = totalPoints / scores.length;
        
        totalCGPA += studentCGPA;
        studentCountWithGrades++;

        // B. Check for Low Performance (SGPA < 6.0 in current semester)
        // Find latest semester
        const maxSem = Math.max(...scores.map(sc => sc.semester || 0));
        const latestSemScores = scores.filter(sc => sc.semester === maxSem);
        
        if (latestSemScores.length > 0) {
           const semTotal = latestSemScores.reduce((sum, sc) => sum + (parseFloat(sc.grade_points || sc.total_marks) || 0), 0);
           const studentSGPA = semTotal / latestSemScores.length;
           
           if (studentSGPA < 6.0) {
             lowPerformanceCount++;
           }
        }
      }
    });

    const avgCGPA = studentCountWithGrades > 0 
      ? (totalCGPA / studentCountWithGrades).toFixed(2) 
      : "0.00";

    // Respond with updated metrics
    res.json({
      totalStudents,
      avgAttendance,
      avgCGPA,           // ✅ New Metric
      lowPerformance: lowPerformanceCount, // ✅ Updated Logic (SGPA < 6.0)
      students,
    });

  } catch (err) {
    console.error("Error fetching proctor dashboard data:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};