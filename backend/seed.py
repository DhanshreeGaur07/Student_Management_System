from config import app, db, bcrypt
from models import User, Student, Subject, Enrollment, Attendance, CompletedCourse
from datetime import date, timedelta
import random

STUDENTS_DATA = [
    {"regno": "CS2021001", "name": "Aarav Sharma", "age": 21, "cgpa": "9.2", "year": 3, "semester": "6", "email": "aarav.sharma@acadportal.edu", "phone": "9876543201", "department": "Computer Science"},
    {"regno": "CS2021002", "name": "Priya Nair", "age": 20, "cgpa": "8.7", "year": 3, "semester": "6", "email": "priya.nair@acadportal.edu", "phone": "9876543202", "department": "Computer Science"},
    {"regno": "CS2021003", "name": "Rohan Mehta", "age": 22, "cgpa": "7.4", "year": 3, "semester": "6", "email": "rohan.mehta@acadportal.edu", "phone": "9876543203", "department": "Computer Science"},
    {"regno": "EC2022001", "name": "Sneha Iyer", "age": 20, "cgpa": "8.9", "year": 2, "semester": "4", "email": "sneha.iyer@acadportal.edu", "phone": "9876543204", "department": "Electronics"},
    {"regno": "EC2022002", "name": "Karan Patel", "age": 21, "cgpa": "7.8", "year": 2, "semester": "4", "email": "karan.patel@acadportal.edu", "phone": "9876543205", "department": "Electronics"},
    {"regno": "ME2023001", "name": "Divya Reddy", "age": 19, "cgpa": "8.1", "year": 1, "semester": "2", "email": "divya.reddy@acadportal.edu", "phone": "9876543206", "department": "Mechanical"},
    {"regno": "ME2023002", "name": "Arjun Singh", "age": 19, "cgpa": "7.5", "year": 1, "semester": "2", "email": "arjun.singh@acadportal.edu", "phone": "9876543207", "department": "Mechanical"},
    {"regno": "CS2020001", "name": "Ananya Krishnan", "age": 22, "cgpa": "9.5", "year": 4, "semester": "8", "email": "ananya.k@acadportal.edu", "phone": "9876543208", "department": "Computer Science"},
    {"regno": "CS2020002", "name": "Vikram Bose", "age": 23, "cgpa": "6.9", "year": 4, "semester": "8", "email": "vikram.bose@acadportal.edu", "phone": "9876543209", "department": "Computer Science"},
    {"regno": "IT2021001", "name": "Meera Pillai", "age": 21, "cgpa": "8.3", "year": 3, "semester": "6", "email": "meera.pillai@acadportal.edu", "phone": "9876543210", "department": "Information Technology"},
]

SUBJECTS_DATA = [
    {"code": "CS301", "name": "Data Structures & Algorithms", "department": "Computer Science", "credits": 4, "year": 3, "semester": "5"},
    {"code": "CS302", "name": "Database Management Systems", "department": "Computer Science", "credits": 3, "year": 3, "semester": "5"},
    {"code": "CS303", "name": "Operating Systems", "department": "Computer Science", "credits": 4, "year": 3, "semester": "6"},
    {"code": "EC201", "name": "Digital Electronics", "department": "Electronics", "credits": 3, "year": 2, "semester": "3"},
    {"code": "EC202", "name": "Signals & Systems", "department": "Electronics", "credits": 4, "year": 2, "semester": "4"},
    {"code": "ME101", "name": "Engineering Mechanics", "department": "Mechanical", "credits": 3, "year": 1, "semester": "1"},
    {"code": "CS401", "name": "Machine Learning", "department": "Computer Science", "credits": 4, "year": 4, "semester": "7"},
    {"code": "CS402", "name": "Cloud Computing", "department": "Computer Science", "credits": 3, "year": 4, "semester": "8"},
    {"code": "IT301", "name": "Web Technologies", "department": "Information Technology", "credits": 3, "year": 3, "semester": "5"},
    {"code": "MATH201", "name": "Discrete Mathematics", "department": "Common", "credits": 3, "year": 2, "semester": "3"},
]

COMPLETED_COURSES = [
    "Python Programming Fundamentals",
    "Introduction to Git & GitHub",
    "SQL Mastery",
    "Linux Essentials",
    "Object Oriented Programming in Java",
]

def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        # Admin user
        admin_pw = bcrypt.generate_password_hash("admin123").decode("utf-8")
        admin = User(username="admin", password_hash=admin_pw, role="admin")
        db.session.add(admin)

        # Subjects
        subject_objs = []
        for sd in SUBJECTS_DATA:
            s = Subject(**sd)
            db.session.add(s)
            subject_objs.append(s)
        db.session.flush()

        # Students + accounts
        student_objs = []
        for sd in STUDENTS_DATA:
            st = Student(**sd)
            db.session.add(st)
            db.session.flush()

            # Student login account
            pw = bcrypt.generate_password_hash(sd["regno"].lower()).decode("utf-8")
            u = User(username=sd["regno"].lower(), password_hash=pw, role="student", student_id=st.id)
            db.session.add(u)

            # Enroll in 2-3 subjects by dept
            dept_subjects = [s for s in subject_objs if s.department == sd["department"] or s.department == "Common"]
            chosen = random.sample(dept_subjects, min(3, len(dept_subjects)))
            for subj in chosen:
                e = Enrollment(student_id=st.id, subject_id=subj.id, grade=random.choice(["A+","A","B+","B","C+",None]))
                db.session.add(e)

            # Attendance records (last 30 days, 3 subjects)
            att_subjects = chosen[:2]
            for subj in att_subjects:
                for i in range(20):
                    d = date.today() - timedelta(days=i*2)
                    present = random.random() > 0.2  # 80% attendance roughly
                    a = Attendance(student_id=st.id, subject_code=subj.code, date=d, status="present" if present else "absent")
                    db.session.add(a)

            # Completed courses (random 1-3)
            for cname in random.sample(COMPLETED_COURSES, random.randint(1, 3)):
                c = CompletedCourse(
                    student_id=st.id, course_name=cname,
                    completion_date=date.today() - timedelta(days=random.randint(30, 400)),
                    grade=random.choice(["A+","A","B+"]),
                    credits=random.choice([2, 3])
                )
                db.session.add(c)

            student_objs.append(st)

        db.session.commit()
        print("✓ Database seeded!")
        print("\nAdmin login:  admin / admin123")
        print("Student logins (username = regno lowercase, password = same):")
        for sd in STUDENTS_DATA:
            print(f"  {sd['regno'].lower()} / {sd['regno'].lower()}  — {sd['name']}")

if __name__ == "__main__":
    seed()