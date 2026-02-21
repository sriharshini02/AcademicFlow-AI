import pdfplumber

# 1. SETUP: Map Index to Subject (0-based Index)
# Column 1 = Roll No (Index 0)
# Column 2 = SGPA    (Index 1)
# Column 3 = CGPA    (Index 2)
# Column 4 = OT      (Index 3) -> START SUBJECTS HERE
SUBJECT_MAP = {
    3:  {"name": "OT",      "credits": 3.0},
    4:  {"name": "DW&D",    "credits": 3.0},
    5:  {"name": "HCI",     "credits": 3.0},
    6:  {"name": "OOSE",    "credits": 3.0},
    7:  {"name": "WT",      "credits": 3.0},
    8:  {"name": "DL",      "credits": 3.0},
    9:  {"name": "WT Lab",  "credits": 1.5},
    10: {"name": "DL Lab",  "credits": 1.5},
    11: {"name": "QA 2",    "credits": 1.5}
}

GRADE_POINTS = {
    'O': 10.0, 'A+': 9.0, 'A': 8.0, 'B+': 7.0, 'B': 6.0, 'C': 5.0, 'P': 4.0, 'F': 0.0, 'AB': 0.0
}

def generate_sql(pdf_path, target_series="A22126552"):
    print(f"--- Processing {pdf_path} ---")
    sql_statements = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if not table: continue
            
            for row in table:
                # Clean row data
                clean_row = [str(c).replace('\n', '').strip() if c else "" for c in row]
                
                # We need at least 4 columns (Roll, SGPA, CGPA, 1 Subject)
                if len(clean_row) < 4: continue

                # 1. GET ROLL NO (Column 1 / Index 0)
                roll_no = clean_row[0]
                
                # Check if it matches your series
                if not roll_no.startswith(target_series):
                    continue

                # 2. GET SGPA & CGPA (Columns 2 & 3 / Index 1 & 2)
                try:
                    pdf_sgpa = float(clean_row[1])
                    pdf_cgpa = float(clean_row[2])
                except ValueError:
                    # If conversion fails (e.g. empty or '-'), skip or set to 0
                    print(f"⚠️ Warning: Invalid SGPA/CGPA for {roll_no}. Defaulting to 0.")
                    pdf_sgpa = 0.0
                    pdf_cgpa = 0.0

                print(f"-> Processing: {roll_no} | SGPA: {pdf_sgpa} | CGPA: {pdf_cgpa}")
                
                total_credits_calculated = 0
                
                # 3. EXTRACT SUBJECT GRADES
                for col_idx, subject_info in SUBJECT_MAP.items():
                    if col_idx >= len(clean_row): break
                    
                    grade = clean_row[col_idx].upper()
                    subject_name = subject_info['name']
                    credits = subject_info['credits']
                    
                    if grade in GRADE_POINTS:
                        points = GRADE_POINTS[grade]
                        total_credits_calculated += credits
                        
                        # Generate SQL for Subject
                        sql = f"""INSERT INTO students_academic_scores 
(student_id, academic_year, semester, subject_code, subject_name, credits, grade_points)
SELECT student_id, '2024-2025', 6, '{subject_name}', '{subject_name}', {credits}, {points}
FROM students_core WHERE roll_number = '{roll_no}';"""
                        sql_statements.append(sql)

                # 4. GENERATE SUMMARY (Using PDF values!)
                sql_summ = f"""INSERT INTO student_semester_summaries 
(student_id, semester, total_credits_earned, sgpa, cgpa)
SELECT student_id, 6, {total_credits_calculated}, {pdf_sgpa}, {pdf_cgpa}
FROM students_core WHERE roll_number = '{roll_no}';"""
                sql_statements.append(sql_summ)
                sql_statements.append("-- -----------------------------------")

    # Save to file
    if len(sql_statements) > 0:
        with open("final_results.sql", "w") as f:
            f.write("\n".join(sql_statements))
        print(f"✅ Success! SQL saved to 'final_results.sql'")
    else:
        print("❌ No data found. Ensure Roll No is in Column 1.")

# Run
generate_sql("4th year 6th sem.pdf")