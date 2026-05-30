from flask import request, jsonify
from config import app, db, bcrypt
from models import User, Student, Attendance, Subject, Enrollment, CompletedCourse
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import date, datetime
import random

def get_current_user():
    identity = get_jwt_identity()
    return User.query.get(int(identity))

# ─── Auth ─────────────────────────────────────────────────────────────────────

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = create_access_token(identity=str(user.id))
    result = user.to_json()
    if user.role == 'student' and user.student_id:
        student = Student.query.get(user.student_id)
        result['student'] = student.to_json() if student else None
    return jsonify({'token': token, 'user': result}), 200

@app.route('/auth/me', methods=['GET'])
@jwt_required()
def me():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    result = user.to_json()
    if user.role == 'student' and user.student_id:
        student = Student.query.get(user.student_id)
        result['student'] = student.to_json() if student else None
    return jsonify({'user': result}), 200

# ─── Students ────────────────────────────────────────────────────────────────

@app.route('/students', methods=['POST'])
@jwt_required()
def add_students():
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    data = request.get_json()
    added = []
    for sd in data.get('students', []):
        regno = sd.get('regno'); name = sd.get('name'); age = sd.get('age')
        cgpa = sd.get('cgpa'); year = sd.get('year'); semester = sd.get('semester')
        if not all([regno, name, age, cgpa, year, semester]):
            return jsonify({'error': 'Missing required fields'}), 400
        if Student.query.filter_by(regno=regno).first():
            return jsonify({'error': f'Student {regno} already exists'}), 400
        student = Student(regno=regno, name=name, age=age, cgpa=str(cgpa),
            year=int(year), semester=str(semester), email=sd.get('email'),
            phone=sd.get('phone'), department=sd.get('department'), address=sd.get('address'))
        db.session.add(student); db.session.flush()
        uname = regno.lower()
        if sd.get('create_account', True):
            if not User.query.filter_by(username=uname).first():
                pw = bcrypt.generate_password_hash(uname).decode('utf-8')
                db.session.add(User(username=uname, password_hash=pw, role='student', student_id=student.id))
        added.append({'regno': regno, 'login_username': uname, 'login_password': uname})
    db.session.commit()
    return jsonify({'message': f'Added {len(added)} student(s)', 'added': added}), 201

@app.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    user = get_current_user()
    if not user: return jsonify({'error': 'Unauthorized'}), 401
    if user.role == 'student':
        if not user.student_id: return jsonify({'students': []}), 200
        s = Student.query.get(user.student_id)
        return jsonify({'students': [s.to_json()] if s else []}), 200
    return jsonify({'students': [s.to_json() for s in Student.query.all()]}), 200

@app.route('/students/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student(student_id):
    user = get_current_user()
    if user.role == 'student' and user.student_id != student_id:
        return jsonify({'error': 'Forbidden'}), 403
    s = Student.query.get(student_id)
    if not s: return jsonify({'error': 'Student not found'}), 404
    return jsonify({'student': s.to_json()}), 200

@app.route('/students/<int:student_id>', methods=['DELETE'])
@jwt_required()
def delete_student(student_id):
    user = get_current_user()
    if not user or user.role != 'admin': return jsonify({'error': 'Admin access required'}), 403
    s = Student.query.get(student_id)
    if not s: return jsonify({'error': 'Student not found'}), 404
    User.query.filter_by(student_id=student_id).delete()
    db.session.delete(s); db.session.commit()
    return jsonify({'message': 'Student deleted'}), 200

@app.route('/students/<int:student_id>', methods=['PATCH'])
@jwt_required()
def update_student(student_id):
    user = get_current_user()
    is_admin = user.role == 'admin'
    if user.role == 'student' and user.student_id != student_id:
        return jsonify({'error': 'Forbidden'}), 403
    s = Student.query.get(student_id)
    if not s: return jsonify({'error': 'Student not found'}), 404
    data = request.get_json()
    for field in ['regno','cgpa','year','semester','age','department','name']:
        if field in data:
            if not is_admin: return jsonify({'error': f'Field "{field}" is admin-only'}), 403
            setattr(s, field, data[field])
    for field in ['phone','address','email']:
        if field in data: setattr(s, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Updated', 'student': s.to_json()}), 200

# ─── Attendance ───────────────────────────────────────────────────────────────

@app.route('/students/<int:student_id>/attendance', methods=['GET'])
@jwt_required()
def get_attendance(student_id):
    user = get_current_user()
    if user.role == 'student' and user.student_id != student_id:
        return jsonify({'error': 'Forbidden'}), 403
    records = Attendance.query.filter_by(student_id=student_id).order_by(Attendance.date.desc()).all()
    by_sub = {}
    for r in records:
        if r.subject_code not in by_sub:
            by_sub[r.subject_code] = {'present': 0, 'absent': 0, 'records': []}
        by_sub[r.subject_code][r.status] += 1
        by_sub[r.subject_code]['records'].append(r.to_json())
    summary = []
    for code, d in by_sub.items():
        total = d['present'] + d['absent']
        summary.append({'subject_code': code, 'present': d['present'], 'absent': d['absent'],
            'total': total, 'percentage': round((d['present']/total)*100,1) if total else 0,
            'records': d['records']})
    return jsonify({'attendance': summary}), 200

@app.route('/students/<int:student_id>/attendance', methods=['POST'])
@jwt_required()
def mark_attendance(student_id):
    user = get_current_user()
    if not user or user.role != 'admin': return jsonify({'error': 'Admin access required'}), 403
    data = request.get_json()
    for rec in data.get('records', []):
        subject_code = rec.get('subject_code'); date_str = rec.get('date'); status = rec.get('status')
        if not all([subject_code, date_str, status]): return jsonify({'error': 'Missing fields'}), 400
        rec_date = date.fromisoformat(date_str)
        existing = Attendance.query.filter_by(student_id=student_id, subject_code=subject_code, date=rec_date).first()
        if existing: existing.status = status
        else: db.session.add(Attendance(student_id=student_id, subject_code=subject_code, date=rec_date, status=status))
    db.session.commit()
    return jsonify({'message': 'Attendance marked'}), 201

# ─── Subjects ────────────────────────────────────────────────────────────────

@app.route('/subjects', methods=['GET'])
@jwt_required()
def get_subjects():
    return jsonify({'subjects': [s.to_json() for s in Subject.query.all()]}), 200

@app.route('/subjects', methods=['POST'])
@jwt_required()
def create_subject():
    user = get_current_user()
    if not user or user.role != 'admin': return jsonify({'error': 'Admin access required'}), 403
    data = request.get_json()
    code = data.get('code'); name = data.get('name')
    if not code or not name: return jsonify({'error': 'Code and name required'}), 400
    if Subject.query.filter_by(code=code).first(): return jsonify({'error': f'Subject {code} already exists'}), 400
    s = Subject(code=code, name=name, department=data.get('department'),
        credits=int(data.get('credits', 3)), year=data.get('year'), semester=str(data.get('semester', '')))
    db.session.add(s); db.session.commit()
    return jsonify({'message': 'Subject created', 'subject': s.to_json()}), 201

@app.route('/subjects/<int:subject_id>', methods=['DELETE'])
@jwt_required()
def delete_subject(subject_id):
    user = get_current_user()
    if not user or user.role != 'admin': return jsonify({'error': 'Admin access required'}), 403
    s = Subject.query.get(subject_id)
    if not s: return jsonify({'error': 'Subject not found'}), 404
    db.session.delete(s); db.session.commit()
    return jsonify({'message': 'Subject deleted'}), 200

# ─── Enrollments ─────────────────────────────────────────────────────────────

@app.route('/students/<int:student_id>/enrollments', methods=['GET'])
@jwt_required()
def get_enrollments(student_id):
    user = get_current_user()
    if user.role == 'student' and user.student_id != student_id:
        return jsonify({'error': 'Forbidden'}), 403
    return jsonify({'enrollments': [e.to_json() for e in Enrollment.query.filter_by(student_id=student_id).all()]}), 200

@app.route('/students/<int:student_id>/enrollments', methods=['POST'])
@jwt_required()
def enroll_student(student_id):
    user = get_current_user()
    if not user or user.role != 'admin': return jsonify({'error': 'Admin access required'}), 403
    data = request.get_json(); subject_id = data.get('subject_id')
    if Enrollment.query.filter_by(student_id=student_id, subject_id=subject_id).first():
        return jsonify({'error': 'Already enrolled'}), 400
    e = Enrollment(student_id=student_id, subject_id=int(subject_id))
    db.session.add(e); db.session.commit()
    return jsonify({'message': 'Enrolled', 'enrollment': e.to_json()}), 201

@app.route('/students/<int:student_id>/enrollments/<int:enrollment_id>', methods=['DELETE'])
@jwt_required()
def unenroll_student(student_id, enrollment_id):
    user = get_current_user()
    if not user or user.role != 'admin': return jsonify({'error': 'Admin access required'}), 403
    e = Enrollment.query.filter_by(id=enrollment_id, student_id=student_id).first()
    if not e: return jsonify({'error': 'Not found'}), 404
    db.session.delete(e); db.session.commit()
    return jsonify({'message': 'Unenrolled'}), 200

@app.route('/students/<int:student_id>/enrollments/<int:enrollment_id>/grade', methods=['PATCH'])
@jwt_required()
def update_grade(student_id, enrollment_id):
    user = get_current_user()
    if not user or user.role != 'admin': return jsonify({'error': 'Admin access required'}), 403
    e = Enrollment.query.filter_by(id=enrollment_id, student_id=student_id).first()
    if not e: return jsonify({'error': 'Not found'}), 404
    e.grade = request.get_json().get('grade')
    db.session.commit()
    return jsonify({'message': 'Grade updated', 'enrollment': e.to_json()}), 200

# ─── Completed Courses ────────────────────────────────────────────────────────

@app.route('/students/<int:student_id>/completed-courses', methods=['GET'])
@jwt_required()
def get_completed_courses(student_id):
    user = get_current_user()
    if user.role == 'student' and user.student_id != student_id:
        return jsonify({'error': 'Forbidden'}), 403
    courses = CompletedCourse.query.filter_by(student_id=student_id).order_by(CompletedCourse.completion_date.desc()).all()
    return jsonify({'completed_courses': [c.to_json() for c in courses]}), 200

@app.route('/students/<int:student_id>/completed-courses', methods=['POST'])
@jwt_required()
def add_completed_course(student_id):
    user = get_current_user()
    if not user or user.role != 'admin': return jsonify({'error': 'Admin access required'}), 403
    data = request.get_json()
    if not data.get('course_name') or not data.get('completion_date'):
        return jsonify({'error': 'course_name and completion_date required'}), 400
    c = CompletedCourse(student_id=student_id, course_name=data['course_name'],
        completion_date=date.fromisoformat(data['completion_date']),
        grade=data.get('grade'), credits=int(data.get('credits', 3)),
        certificate_url=data.get('certificate_url'))
    db.session.add(c); db.session.commit()
    return jsonify({'message': 'Course added', 'course': c.to_json()}), 201

@app.route('/students/<int:student_id>/completed-courses/<int:course_id>', methods=['DELETE'])
@jwt_required()
def delete_completed_course(student_id, course_id):
    user = get_current_user()
    if not user or user.role != 'admin': return jsonify({'error': 'Admin access required'}), 403
    c = CompletedCourse.query.filter_by(id=course_id, student_id=student_id).first()
    if not c: return jsonify({'error': 'Not found'}), 404
    db.session.delete(c); db.session.commit()
    return jsonify({'message': 'Course deleted'}), 200

# ─── Dashboard ────────────────────────────────────────────────────────────────

@app.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def dashboard_stats():
    user = get_current_user()
    if not user or user.role != 'admin': return jsonify({'error': 'Admin access required'}), 403
    students = Student.query.all()
    total = len(students)
    avg_cgpa = round(sum(float(s.cgpa) for s in students) / total, 2) if total else 0
    return jsonify({
        'total_students': total,
        'avg_cgpa': avg_cgpa,
        'final_year_students': sum(1 for s in students if s.year == 4),
        'total_subjects': Subject.query.count(),
        'total_enrollments': Enrollment.query.count(),
    }), 200

# ─── Admin ────────────────────────────────────────────────────────────────────

@app.route('/admin/users', methods=['GET'])
@jwt_required()
def get_users():
    user = get_current_user()
    if not user or user.role != 'admin': return jsonify({'error': 'Admin access required'}), 403
    return jsonify({'users': [u.to_json() for u in User.query.all()]}), 200

@app.route('/admin/users', methods=['POST'])
@jwt_required()
def create_user():
    user = get_current_user()
    if not user or user.role != 'admin': return jsonify({'error': 'Admin access required'}), 403
    data = request.get_json()
    if not data.get('username') or not data.get('password'): return jsonify({'error': 'Username and password required'}), 400
    if User.query.filter_by(username=data['username']).first(): return jsonify({'error': 'Username exists'}), 400
    pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    u = User(username=data['username'], password_hash=pw, role=data.get('role','student'), student_id=data.get('student_id'))
    db.session.add(u); db.session.commit()
    return jsonify({'message': 'User created', 'user': u.to_json()}), 201

@app.route('/admin/reset-password/<int:user_id>', methods=['PATCH'])
@jwt_required()
def reset_password(user_id):
    current = get_current_user()
    if not current or current.role != 'admin': return jsonify({'error': 'Admin access required'}), 403
    u = User.query.get(user_id)
    if not u: return jsonify({'error': 'User not found'}), 404
    pw = request.get_json().get('password')
    if not pw: return jsonify({'error': 'Password required'}), 400
    u.password_hash = bcrypt.generate_password_hash(pw).decode('utf-8')
    db.session.commit()
    return jsonify({'message': 'Password reset'}), 200


# ─── Seed Data ────────────────────────────────────────────────────────────────

def seed_database():
    if User.query.count() > 0:
        return  # Already seeded

    print("🌱 Seeding database with dummy data...")

    # Create admin
    admin_pw = bcrypt.generate_password_hash('admin123').decode('utf-8')
    admin = User(username='admin', password_hash=admin_pw, role='admin')
    db.session.add(admin)

    # Subjects
    subjects_data = [
        ('CS101', 'Data Structures & Algorithms', 'Computer Science', 4, 1, '1'),
        ('CS102', 'Object Oriented Programming', 'Computer Science', 4, 1, '2'),
        ('CS201', 'Database Management Systems', 'Computer Science', 3, 2, '3'),
        ('CS202', 'Operating Systems', 'Computer Science', 4, 2, '4'),
        ('CS301', 'Computer Networks', 'Computer Science', 3, 3, '5'),
        ('CS302', 'Software Engineering', 'Computer Science', 3, 3, '6'),
        ('CS401', 'Machine Learning', 'Computer Science', 4, 4, '7'),
        ('CS402', 'Cloud Computing', 'Computer Science', 3, 4, '8'),
        ('MA101', 'Engineering Mathematics I', 'Mathematics', 4, 1, '1'),
        ('MA201', 'Probability & Statistics', 'Mathematics', 3, 2, '3'),
        ('PH101', 'Engineering Physics', 'Physics', 3, 1, '1'),
        ('EC101', 'Basic Electronics', 'Electronics', 3, 1, '2'),
    ]
    subjects = []
    for code, name, dept, credits, year, sem in subjects_data:
        s = Subject(code=code, name=name, department=dept, credits=credits, year=year, semester=sem)
        db.session.add(s)
        subjects.append(s)
    db.session.flush()

    # Students
    students_data = [
        ('REG2021001', 'Arjun Mehta', 20, '8.75', 4, '7', 'arjun.mehta@college.edu', '9876543210', 'Computer Science', 'Mumbai, Maharashtra'),
        ('REG2021002', 'Priya Sharma', 21, '9.20', 4, '7', 'priya.sharma@college.edu', '9876543211', 'Computer Science', 'Pune, Maharashtra'),
        ('REG2021003', 'Rahul Singh', 20, '7.80', 4, '7', 'rahul.singh@college.edu', '9876543212', 'Electronics', 'Delhi, India'),
        ('REG2021004', 'Sneha Patel', 21, '8.50', 4, '7', 'sneha.patel@college.edu', '9876543213', 'Computer Science', 'Ahmedabad, Gujarat'),
        ('REG2022001', 'Kiran Reddy', 19, '8.10', 3, '5', 'kiran.reddy@college.edu', '9876543214', 'Computer Science', 'Hyderabad, Telangana'),
        ('REG2022002', 'Ananya Iyer', 20, '9.05', 3, '5', 'ananya.iyer@college.edu', '9876543215', 'Mathematics', 'Chennai, Tamil Nadu'),
        ('REG2022003', 'Vikram Joshi', 19, '6.90', 3, '5', 'vikram.joshi@college.edu', '9876543216', 'Computer Science', 'Nagpur, Maharashtra'),
        ('REG2022004', 'Deepika Nair', 20, '8.80', 3, '6', 'deepika.nair@college.edu', '9876543217', 'Computer Science', 'Kochi, Kerala'),
        ('REG2023001', 'Aditya Kumar', 18, '7.60', 2, '3', 'aditya.kumar@college.edu', '9876543218', 'Electronics', 'Patna, Bihar'),
        ('REG2023002', 'Meera Gupta', 18, '8.30', 2, '3', 'meera.gupta@college.edu', '9876543219', 'Computer Science', 'Jaipur, Rajasthan'),
        ('REG2023003', 'Rohit Verma', 19, '7.20', 2, '4', 'rohit.verma@college.edu', '9876543220', 'Computer Science', 'Lucknow, UP'),
        ('REG2023004', 'Kavya Pillai', 18, '9.40', 2, '3', 'kavya.pillai@college.edu', '9876543221', 'Mathematics', 'Trivandrum, Kerala'),
        ('REG2024001', 'Nikhil Bose', 18, '7.90', 1, '1', 'nikhil.bose@college.edu', '9876543222', 'Computer Science', 'Kolkata, West Bengal'),
        ('REG2024002', 'Sania Khan', 18, '8.60', 1, '2', 'sania.khan@college.edu', '9876543223', 'Computer Science', 'Bhopal, MP'),
        ('REG2024003', 'Harsh Agarwal', 18, '6.50', 1, '1', 'harsh.agarwal@college.edu', '9876543224', 'Electronics', 'Varanasi, UP'),
    ]

    random.seed(42)
    all_students = []
    for regno, name, age, cgpa, year, semester, email, phone, dept, addr in students_data:
        s = Student(regno=regno, name=name, age=age, cgpa=cgpa, year=year, semester=semester,
            email=email, phone=phone, department=dept, address=addr)
        db.session.add(s)
        all_students.append(s)
    db.session.flush()

    # Create student login accounts
    for s in all_students:
        pw = bcrypt.generate_password_hash(s.regno).decode('utf-8')
        db.session.add(User(username=s.regno.lower(), password_hash=pw, role='student', student_id=s.id))

    db.session.flush()

    # Enroll students in subjects based on year
    year_subjects = {
        1: [subjects[0], subjects[1], subjects[8], subjects[10], subjects[11]],
        2: [subjects[2], subjects[3], subjects[9]],
        3: [subjects[4], subjects[5]],
        4: [subjects[6], subjects[7]],
    }
    for s in all_students:
        relevant = []
        for y in range(1, s.year + 1):
            relevant.extend(year_subjects.get(y, []))
        current_subs = year_subjects.get(s.year, [])[:3]
        for sub in current_subs:
            e = Enrollment(student_id=s.id, subject_id=sub.id)
            grades = ['A+', 'A', 'B+', 'B', None]
            if s.year > 1:
                e.grade = random.choice(grades[:3])
            db.session.add(e)

    db.session.flush()

    # Generate attendance records
    from datetime import timedelta
    for s in all_students:
        enrollments = Enrollment.query.filter_by(student_id=s.id).all()
        base_attendance = float(s.cgpa) / 10.0 * 0.4 + 0.55  # 55-95% range
        for enr in enrollments:
            # 30 classes per subject
            start = date(2025, 1, 15)
            for i in range(30):
                cls_date = start + timedelta(days=i * 3)
                status = 'present' if random.random() < base_attendance else 'absent'
                db.session.add(Attendance(student_id=s.id, subject_code=enr.subject.code,
                    date=cls_date, status=status))

    db.session.flush()

    # Add completed courses for year 2, 3, 4 students
    completed_courses_pool = [
        ('Introduction to Programming', '2023-05-30', 'A+', 3),
        ('Web Development Fundamentals', '2023-05-30', 'A', 3),
        ('Linear Algebra', '2023-12-15', 'B+', 4),
        ('Discrete Mathematics', '2024-05-28', 'A', 3),
        ('Digital Logic Design', '2024-05-28', 'B+', 3),
        ('Computer Architecture', '2024-12-10', 'A', 4),
        ('Theory of Computation', '2025-05-30', 'A+', 3),
        ('Compiler Design', '2025-05-30', 'B+', 3),
    ]
    for s in all_students:
        if s.year >= 2:
            num = min(s.year * 2, len(completed_courses_pool))
            for name, comp_date, grade, credits in random.sample(completed_courses_pool, num):
                db.session.add(CompletedCourse(student_id=s.id, course_name=name,
                    completion_date=date.fromisoformat(comp_date), grade=grade, credits=credits))

    db.session.commit()
    print(f"✅ Seeded {len(all_students)} students, {len(subjects_data)} subjects, attendance & completed courses")
    print("👤 Admin login: admin / admin123")
    print("👤 Student login example: reg2021001 / REG2021001")


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_database()
    app.run(debug=True)