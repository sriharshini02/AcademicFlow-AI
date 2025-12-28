import XLSX from 'xlsx';
import db from '../models/index.js';

const StudentCore = db.StudentCore;
const StudentPersonalInfo = db.StudentPersonalInfo;

// ---------------- CONFIGURATION ----------------
const FILE_PATH = "C:\\Users\\DELL\\OneDrive\\Desktop\\Project data files\\Modified 2023-24 Batch student New deta.xlsx";
const TARGET_SHEETS = ['CSM-A', 'CSM-B', 'CSM-C', 'CSM-D', 'CSD-A', 'CSD-B', 'CSD-C'];
const BATCH_YEAR = '3'; 
// -----------------------------------------------

// 🛠️ ROBUST DATE PARSER
const parseDate = (dateVal) => {
  if (!dateVal) return null;

  // 1. Handle Excel Serial Numbers (e.g., 38928)
  if (typeof dateVal === 'number') {
    const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }

  const str = dateVal.toString().trim();

  // 2. Handle DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY
  // We replace dots and slashes with dashes first
  const normalized = str.replace(/\./g, '-').replace(/\//g, '-');
  
  const parts = normalized.split('-');
  
  // If it matches DD-MM-YYYY (e.g., 19-05-2005)
  if (parts.length === 3) {
    // If first part is 4 digits, assume it's already YYYY-MM-DD
    if (parts[0].length === 4) return normalized;
    
    // Otherwise, assume DD-MM-YYYY and convert to YYYY-MM-DD
    // parts[0] = Day, parts[1] = Month, parts[2] = Year
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  // 3. Fallback: Return null if unknown format
  console.warn(`⚠️ Unrecognized date format: ${str}`);
  return null;
};

const importStudents = async () => {
  try {
    console.log(`📂 Reading Excel file...`);
    const workbook = XLSX.readFile(FILE_PATH);

    let totalSuccess = 0;
    let totalErrors = 0;

    for (const sheetName of TARGET_SHEETS) {
      if (!workbook.Sheets[sheetName]) continue;

      const [dept, secPart] = sheetName.split('-');
      const section = secPart || 'A';
      
      console.log(`\n📄 Processing Sheet: ${sheetName} (Dept: ${dept}, Sec: ${section})`);
      const sheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      let headerRowIndex = -1;
      
      for (let i = 0; i < rows.length; i++) {
        const rowStr = JSON.stringify(rows[i]);
        if (rowStr && rowStr.includes("Roll no") && rowStr.includes("Name")) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        console.error(`   ❌ Could not find header row in ${sheetName}`);
        continue;
      }

      const headers = rows[headerRowIndex];
      const dataRows = rows.slice(headerRowIndex + 1);

      for (const rowArray of dataRows) {
        if (!rowArray || rowArray.length === 0) continue;

        const getValue = (keyPart) => {
          const index = headers.findIndex(h => h && h.toString().toLowerCase().includes(keyPart.toLowerCase()));
          return index > -1 ? rowArray[index] : null;
        };

        try {
          const rollNo = getValue("Roll no");
          const name = getValue("Name");

          if (!rollNo || !name) continue;

          const cleanRoll = rollNo.toString().trim();
          
          const lateralRaw = getValue("Lateral"); 
          const isLateral = (lateralRaw == 1); 

          const genderRaw = getValue("Gender");
          let gender = 'Male';
          if (genderRaw == 1 || (genderRaw && genderRaw.toString().toLowerCase().includes('f'))) {
            gender = 'Female';
          }

          const joinYear = getValue("Year \nOf Join") || getValue("Join");
          const completionYear = getValue("Completion\nYear") || getValue("Completion");
          
          // ✅ Parse DOB with new logic
          const dobRaw = getValue("DOB");
          const dob = parseDate(dobRaw);

          // ----------------------------------------------------
          // 🚀 DATABASE UPSERT
          // ----------------------------------------------------
          
          const [student] = await StudentCore.upsert({
            roll_number: cleanRoll,
            full_name: name.toString().trim(),
            year_group: BATCH_YEAR,
            department: dept,
            section: section,
            admission_type: isLateral ? 'LATERAL' : 'NORMAL',
            joining_year: joinYear ? joinYear.toString() : null,
            completion_year: completionYear ? completionYear.toString() : null
          });

          const addressParts = [
            getValue("DoorNo1"), getValue("Street1"), getValue("Village1"), 
            getValue("Mandal1"), getValue("District1"), getValue("State1"), getValue("PinCode1")
          ].filter(Boolean).join(', ');

          await StudentPersonalInfo.upsert({
            student_id: student.student_id,
            phone_number: getValue("Student MobileNo")?.toString(),
            father_name: getValue("Father Name"),
            father_phone: getValue("Parent MobileNo")?.toString(),
            mother_name: getValue("Mother Name"),
            mother_phone: getValue("Mother Mobile")?.toString(),
            college_email: `${cleanRoll.toLowerCase()}@anits.edu.in`,
            address: addressParts || null,
            gender: gender,
            date_of_birth: dob // ✅ Saving Validated DOB
          });

          totalSuccess++;
          if (totalSuccess % 50 === 0) process.stdout.write('.');

        } catch (err) {
          console.error(`   ❌ Error on row: ${err.message}`);
          totalErrors++;
        }
      }
    }

    console.log(`\n\n✅ IMPORT COMPLETE!`);
    console.log(`   Students Processed: ${totalSuccess}`);
    process.exit();

  } catch (err) {
    console.error("🔥 Critical Error:", err.message);
    process.exit(1);
  }
};

importStudents();