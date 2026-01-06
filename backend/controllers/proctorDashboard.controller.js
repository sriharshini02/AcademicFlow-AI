import { Controller, Get, Middleware } from '@overnightjs/core';
import db from "../models/index.js";
import { verifyToken } from "../middleware/jwt-auth.middleware.js";

@Controller('api/proctor')
export class ProctorDashboardController {
  @Get('/dashboard')
  @Middleware([verifyToken])
  async getProctorDashboardData(req, res) {
    try {
      const proctorId = req.user.user_id; // assuming middleware sets req.user
      const students = await db.StudentCore.findAll({
        where: { assigned_proctor_id: proctorId },
        include: [
          { model: db.StudentAttendance, limit: 1, order: [["id", "DESC"]] },
          { model: db.StudentAcademicScore },
        ],
      });

      const totalStudents = students.length;

      // Compute average attendance
      const attendanceValues = students.flatMap(s =>
        s.student_attendances?.map(a => a.attendance_percentage) || []
      );
      const avgAttendance =
        attendanceValues.length > 0
          ? (attendanceValues.reduce((a, b) => a + b, 0) / attendanceValues.length).toFixed(1)
          : 0;

      // Compute average internal marks
      const internalValues = students.flatMap(s =>
        s.student_academic_scores?.map(a => a.internal_marks) || []
      );
      const avgInternal =
        internalValues.length > 0
          ? (internalValues.reduce((a, b) => a + b, 0) / internalValues.length).toFixed(1)
          : 0;

      // Identify low performers (<40 internal marks)
      const lowPerformance = students.filter(s =>
        s.student_academic_scores?.some(a => a.internal_marks < 40)
      ).length;

      res.json({
        totalStudents,
        avgAttendance,
        avgInternal,
        lowPerformance,
        students,
      });
    } catch (err) {
      console.error("Error fetching proctor dashboard data:", err);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  }
}
