import pdfplumber

# 1. SETUP: Map Index to Subject (0-based Index)
# Column 1 (Index 0) = Roll No
# Column 2 (Index 1) = SGPA
# Column 3 (Index 2) = CGPA
# Column 4 (Index 3) = Starts Subjects
SUBJECT_MAP = {
    3:  {"name": "ODE&N",     "credits": 4.0}, # Ordinary Differential Equations
    4:  {"name": "AP",        "credits": 4.0}, # Applied Physics
    5:  {"name": "PWITH",     "credits": 3.0}, # Programming with Python
    6:  {"name": "DT",        "credits": 3.0}, # Digital Techniques
    7:  {"name": "CAEG",      "credits": 3.0}, # Computer Aided Eng Graphics
    8:  {"name": "AP LA",     "credits": 1.5}, # Applied Physics Lab
    9:  {"name": "PWITH lab", "credits": 1.5},
    10: {"name": "E & ITW",   "credits": 1.5}, # Eng & IT Workshop
    11: {"name": "UHV&E",     "credits": 2.0}  # Universal Human Values
}

GRADE_POINTS = {
    'O': 10.0, 'A+': 9.0, 'A': 8.0, 'B+': 7.0, 'B': 6.0, 'C': 5.0, 'P': 4.0, 'F': 0.0, 'AB': 0.0
}

def generate_sql(pdf_path, target_series="A24126552"):
    print(f"--- Processing {pdf_path} ---")
    sql_statements = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if not table: continue
            
            for row in table:
                # Clean row data
                clean_row = [str(c).replace('\n', '').strip() if c else "" for c in row]
                
                # Check minimum columns (Roll, SGPA, CGPA, at least 1 subject)
                if len(clean_row) < 4: continue

                # 1. GET ROLL NO
                roll_no = clean_row[0]
                
                # Verify Series
                if not roll_no.startswith(target_series):
                    continue

                # 2. GET SGPA & CGPA
                try:
                    pdf_sgpa = float(clean_row[1])
                    pdf_cgpa = float(clean_row[2])
                except ValueError:
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
                        
                        # Generate SQL (Semester 2)
                        sql = f"""INSERT INTO students_academic_scores 
(student_id, academic_year, semester, subject_code, subject_name, credits, grade_points)
SELECT student_id, '2024-2025', 2, '{subject_name}', '{subject_name}', {credits}, {points}
FROM students_core WHERE roll_number = '{roll_no}';"""
                        sql_statements.append(sql)

                # 4. GENERATE SUMMARY
                sql_summ = f"""INSERT INTO student_semester_summaries 
(student_id, semester, total_credits_earned, sgpa, cgpa)
SELECT student_id, 2, {total_credits_calculated}, {pdf_sgpa}, {pdf_cgpa}
FROM students_core WHERE roll_number = '{roll_no}';"""
                sql_statements.append(sql_summ)
                sql_statements.append("-- -----------------------------------")

    # Save to file
    if len(sql_statements) > 0:
        with open("results_sem2.sql", "w") as f:
            f.write("\n".join(sql_statements))
        print(f"✅ Success! SQL saved to 'results_sem2.sql'")
    else:
        print("❌ No data found. Ensure Roll No is in Column 1.")

# Run
generate_sql("2nd year 2nd sem.pdf")