import db from "../models/index";
import { Request, Response } from 'express';
/**
 * ✅ Add new student (Core + Personal Info)
 */
export const addStudent = async (req: Request, res: Response) => {
  const t = await db.sequelize.transaction();
  try {
    const proctorId = req.body.userId; // from auth middleware
    const {
      roll_number,
      full_name,
      year_group,
      department,
      admission_type,
      personal_info,
    } = req.body;

    // 1️⃣ Create student_core entry
    const student = await db.StudentCore.create(
      {
        roll_number,
        full_name,
        year_group,
        department,
        admission_type,
        assigned_proctor_id: proctorId,
      },
      { transaction: t }
    );

    // 2️⃣ Create personal info if provided
    if (personal_info) {
      await db.StudentPersonalInfo.create(
        {
          student_id: student.student_id,
          phone_number: personal_info.phone_number,
          college_email: personal_info.college_email,
          personal_email: personal_info.personal_email,
          father_name: personal_info.father_name,
          father_phone: personal_info.father_phone,
          mother_name: personal_info.mother_name,
          mother_phone: personal_info.mother_phone,
        },
        { transaction: t }
      );
    }

    await t.commit();
    res.status(201).json({ message: "Student added successfully", student });
  } catch (error) {
    await t.rollback();
    console.error("❌ Error adding student:", error);
    res.status(500).json({ error: "Failed to add student" });
  }
};

/**
 * ✏️ Update student (Core or Personal Info)
 */
export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    full_name,
    year_group,
    department,
    admission_type,
    personal_info,
  } = req.body;

  const t = await db.sequelize.transaction();
  try {
    const student = await db.StudentCore.findByPk(id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // 1️⃣ Update core details
    await student.update(
      { full_name, year_group, department, admission_type },
      { transaction: t }
    );

    // 2️⃣ Update or create personal info
    if (personal_info) {
      const personal = await db.StudentPersonalInfo.findOne({
        where: { student_id: id },
      });

      if (personal) {
        await personal.update(personal_info, { transaction: t });
      } else {
        await db.StudentPersonalInfo.create(
          { ...personal_info, student_id: id },
          { transaction: t }
        );
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

/**
 * 🔍 Get full student details with associations
 */
export const getStudentDetails = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const student = await db.StudentCore.findByPk(id, {
      include: [
        { model: db.StudentPersonalInfo },
        { model: db.StudentAcademicScore },
        { model: db.StudentMidtermScore },
        { model: db.StudentLabExam },
        { model: db.StudentAttendance },
        { model: db.StudentExtracurricular },
      ],
    });

    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (error) {
    console.error("❌ Error fetching student details:", error);
    res.status(500).json({ error: "Failed to fetch student details" });
  }
};
