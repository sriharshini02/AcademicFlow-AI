import XLSX from 'xlsx';
import db from '../models/index.js';

const StudentCore = db.StudentCore;
const StudentPersonalInfo = db.StudentPersonalInfo;

// ---------------- CONFIGURATION ----------------
const FILE_PATH = "C:\\Users\\DELL\\OneDrive\\Desktop\\Project data files\\CSM-A,B,C&D Students Deta.xlsx";
const TARGET_SHEETS = ['CSM-A', 'CSM-B', 'CSM-C', 'CSM-D', 'L.E.s'];
const BATCH_YEAR = '2'; // User specified these are 2nd years
const DEPT = 'CSM';
// -----------------------------------------------

// 🛠️ ROBUST DATE PARSER
const parseDate = (dateVal) => {
  if (!dateVal) return null;

  // 1. Handle Excel Serial Numbers
  if (typeof dateVal === 'number') {
    const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }

  const str = dateVal.toString().trim();

  // 2. Handle DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
  const normalized = str.replace(/\./g, '-').replace(/\//g, '-');
  const parts = normalized.split('-');
  
  if (parts.length === 3) {
    // If YYYY-MM-DD
    if (parts[0].length === 4) return normalized;
    // If DD-MM-YYYY -> Convert to YYYY-MM-DD
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return null;
};

const importYear2New = async () => {
  try {
    console.log(`📂 Reading Excel file: ${FILE_PATH}`);
    const workbook = XLSX.readFile(FILE_PATH);

    let totalSuccess = 0;
    let totalErrors = 0;

    for (const sheetName of TARGET_SHEETS) {
      if (!workbook.Sheets[sheetName]) {
        console.warn(`⚠️ Sheet "${sheetName}" not found. Skipping...`);
        continue;
      }

      console.log(`\n📄 Processing Sheet: ${sheetName}`);
      const sheet = workbook.Sheets[sheetName];

      // 1. Find Header Row Dynamically
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      let headerRowIndex = -1;
      
      for (let i = 0; i < rows.length; i++) {
        const rowStr = JSON.stringify(rows[i]);
        // Look for common headers
        if (rowStr && (rowStr.includes("Roll no") || rowStr.includes("HTNo")) && rowStr.includes("Name")) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        console.error(`   ❌ Could not find header row in ${sheetName}`);
        continue;
      }

      // 2. Map Data
      const headers = rows[headerRowIndex];
      const dataRows = rows.slice(headerRowIndex + 1);

      // 3. Determine Default Section Strategy
      let defaultSection = 'A';
      const isLESheet = sheetName === 'L.E.s';

      if (!isLESheet) {
        // Derive section from sheet name (CSM-B -> B)
        defaultSection = sheetName.split('-')[1] || 'A';
      }

      for (const rowArray of dataRows) {
        if (!rowArray || rowArray.length === 0) continue;

        const getValue = (keyPart) => {
            // Flexible matching for headers with newlines or *
            const index = headers.findIndex(h => h && h.toString().toLowerCase().replace(/[\n\r]/g, '').includes(keyPart.toLowerCase()));
            return index > -1 ? rowArray[index] : null;
        };

        try {
          // Roll No can be "Roll no*" or "HTNo*"
          const rollNo = getValue("Roll no") || getValue("HTNo");
          const name = getValue("Name");

          if (!rollNo || !name) continue;

          const cleanRoll = rollNo.toString().trim();
          
          // --- EXTRACT FIELDS ---
          
          // 1. Section Logic
          let section = defaultSection;
          if (isLESheet) {
              const rowSec = getValue("Section"); // L.E.s sheet has a specific column
              if (rowSec) section = rowSec.toString().trim().toUpperCase();
          }

          // 2. Lateral Entry (0/1)
          const lateralRaw = getValue("Lateral"); 
          const isLateral = (lateralRaw == 1); 

          // 3. Gender (0=Male, 1=Female)
          const genderRaw = getValue("Gender");
          let gender = 'Male';
          if (genderRaw == 1 || (genderRaw && genderRaw.toString().toLowerCase().includes('f'))) {
            gender = 'Female';
          }

          // 4. Years
          const joinYear = getValue("Year") || getValue("Join"); // Matches "Year Of Join"
          const completionYear = getValue("Completion"); // Matches "Completion Year"
          
          // 5. DOB
          const dob = parseDate(getValue("DOB"));

          // ----------------------------------------------------
          // 🚀 DATABASE UPSERT
          // ----------------------------------------------------
          
          const [student] = await StudentCore.upsert({
            roll_number: cleanRoll,
            full_name: name.toString().trim(),
            year_group: BATCH_YEAR,
            department: DEPT,
            section: section,
            admission_type: (isLateral || isLESheet) ? 'LATERAL' : 'NORMAL', // Force Lateral if on L.E.s sheet
            joining_year: joinYear ? joinYear.toString() : null,
            completion_year: completionYear ? completionYear.toString() : null
          });

          // Address
          const addressParts = [
            getValue("DoorNo1"), getValue("Street1"), getValue("Village1"), 
            getValue("Mandal1"), getValue("District1"), getValue("State1"), getValue("PinCode1")
          ].filter(Boolean).join(', ');

          // Personal Info
          await StudentPersonalInfo.upsert({
            student_id: student.student_id,
            phone_number: getValue("Student MobileNo")?.toString() || getValue("Student Mobile")?.toString(),
            father_name: getValue("Father Name"),
            father_phone: getValue("Parent MobileNo")?.toString() || getValue("Parent Mobile")?.toString(),
            mother_name: getValue("Mother Name"),
            mother_phone: getValue("Mother Mobile")?.toString(),
            college_email: `${cleanRoll.toLowerCase()}@anits.edu.in`,
            address: addressParts || null,
            gender: gender,
            date_of_birth: dob
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
    console.log(`   Errors:             ${totalErrors}`);
    process.exit();

  } catch (err) {
    console.error("🔥 Critical Error:", err.message);
    process.exit(1);
  }
};

importYear2New();