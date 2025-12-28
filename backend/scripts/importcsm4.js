import XLSX from 'xlsx';
import db from '../models/index.js';

const StudentCore = db.StudentCore;
const StudentPersonalInfo = db.StudentPersonalInfo;

// ---------------- CONFIGURATION ----------------
const FILE_PATH = "C:\\Users\\DELL\\OneDrive\\Desktop\\Project data files\\II Year CSM.xls";
const TARGET_SHEET = 'I YEAR CSM'; // ✅ Specific sheet name
const BATCH_YEAR = '4'; // 4th Year Students
const DEPT = 'CSM';
// -----------------------------------------------

// 🛠️ ROBUST DATE PARSER (Reused)
const parseDate = (dateVal) => {
  if (!dateVal) return null;
  if (typeof dateVal === 'number') {
    const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  const str = dateVal.toString().trim();
  const normalized = str.replace(/\./g, '-').replace(/\//g, '-');
  const parts = normalized.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) return normalized;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return null;
};

const importYear4 = async () => {
  try {
    console.log(`📂 Reading Excel file: ${FILE_PATH}`);
    const workbook = XLSX.readFile(FILE_PATH);

    let totalSuccess = 0;
    let totalErrors = 0;

    if (!workbook.Sheets[TARGET_SHEET]) {
        console.error(`❌ Sheet "${TARGET_SHEET}" not found in file!`);
        process.exit(1);
    }

    console.log(`\n📄 Processing Sheet: ${TARGET_SHEET}`);
    const sheet = workbook.Sheets[TARGET_SHEET];

    // 1. Find Header Row Dynamically
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    let headerRowIndex = -1;
    
    for (let i = 0; i < rows.length; i++) {
        const rowStr = JSON.stringify(rows[i]);
        if (rowStr && rowStr.includes("Roll no") && rowStr.includes("Name")) {
            headerRowIndex = i;
            console.log(`   ✅ Headers found at row ${i + 1}`);
            break;
        }
    }

    if (headerRowIndex === -1) {
        console.error(`   ❌ Could not find header row (Roll no, Name)`);
        process.exit(1);
    }

    // 2. Map Data
    const headers = rows[headerRowIndex];
    const dataRows = rows.slice(headerRowIndex + 1);

    for (const rowArray of dataRows) {
        if (!rowArray || rowArray.length === 0) continue;

        // Helper to find value by column name
        const getValue = (keyPart) => {
            const index = headers.findIndex(h => h && h.toString().toLowerCase().includes(keyPart.toLowerCase()));
            return index > -1 ? rowArray[index] : null;
        };

        try {
            const rollNo = getValue("Roll no");
            const name = getValue("Name");

            if (!rollNo || !name) continue;

            const cleanRoll = rollNo.toString().trim();
            
            // --- EXTRACT FIELDS ---
            
            // 1. Section (From Data Column)
            const sectionRaw = getValue("Section");
            const section = sectionRaw ? sectionRaw.toString().trim().toUpperCase() : 'A'; // Default to A if missing

            // 2. Lateral Entry
            const lateralRaw = getValue("Lateral"); 
            const isLateral = (lateralRaw == 1); 

            // 3. Gender
            const genderRaw = getValue("Gender");
            let gender = 'Male';
            if (genderRaw == 1 || (genderRaw && genderRaw.toString().toLowerCase().includes('f'))) {
                gender = 'Female';
            }

            // 4. Years
            const joinYear = getValue("Year Of Join");
            const completionYear = getValue("CompletionYear");
            
            // 5. DOB
            const dob = parseDate(getValue("DOB"));

            // ----------------------------------------------------
            // 🚀 DATABASE UPSERT
            // ----------------------------------------------------
            
            // Core Data
            const [student] = await StudentCore.upsert({
                roll_number: cleanRoll,
                full_name: name.toString().trim(),
                year_group: BATCH_YEAR,
                department: DEPT,
                section: section, // ✅ Uses Section from Excel Column
                admission_type: isLateral ? 'LATERAL' : 'NORMAL',
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
                phone_number: getValue("Student MobileNo")?.toString(),
                father_name: getValue("Father Name"),
                father_phone: getValue("Parent MobileNo")?.toString(),
                mother_name: getValue("Mother Name"), // Might be missing in this file, returns null safe
                college_email: `${cleanRoll.toLowerCase()}@anits.edu.in`, // ✅ Auto-generated
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

    console.log(`\n\n✅ IMPORT COMPLETE!`);
    console.log(`   Students Processed: ${totalSuccess}`);
    console.log(`   Errors:             ${totalErrors}`);
    process.exit();

  } catch (err) {
    console.error("🔥 Critical Error:", err.message);
    process.exit(1);
  }
};

importYear4();