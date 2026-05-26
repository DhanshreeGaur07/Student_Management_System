from flask import request, jsonify
from config import app, db, bcrypt
from models import User, Student, Attendance, Subject, Enrollment, CompletedCourse
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, get_jwt
)
from datetime import date
import json


# ─── Auth helpers ────────────────────────────────────────────────────────────

def get_current_user():
    identity = get_jwt_identity()
    return User.query.get(int(identity))

def admin_required(fn):
    from functools import wraps
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


# ─── Auth routes ─────────────────────────────────────────────────────────────

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


# ─── Student CRUD (admin) ────────────────────────────────────────────────────

@app.route('/students', methods=['POST'])
@jwt_required()
def add_students():
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    students_data = data.get('students', [])

    added = []
    for sd in students_data:
        regno = sd.get('regno')
        name = sd.get('name')
        age = sd.get('age')
        cgpa = sd.get('cgpa')
        year = sd.get('year')
        semester = sd.get('semester')

        if not all([regno, name, age, cgpa, year, semester]):
            return jsonify({'error': 'Missing required fields'}), 400

        if Student.query.filter_by(regno=regno).first():
            return jsonify({'error': f'Student {regno} already exists'}), 400

        student = Student(
            regno=regno, name=name, age=age, cgpa=str(cgpa),
            year=int(year), semester=str(semester),
            email=sd.get('email'), phone=sd.get('phone'),
            department=sd.get('department'), address=sd.get('address')
        )
        db.session.add(student)
        db.session.flush()

        # Auto-create login account for student
        if sd.get('create_account', True):
            username = regno.lower()
            existing_user = User.query.filter_by(username=username).first()
            if not existing_user:
                pw = bcrypt.generate_password_hash(regno).decode('utf-8')
                user_acc = User(username=username, password_hash=pw, role='student', student_id=student.id)
                db.session.add(user_acc)

        added.append(student.regno)

    db.session.commit()
    return jsonify({'message': f'Added {len(added)} student(s)', 'added': added}), 201


@app.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    if user.role == 'student':
        if not user.student_id:
            return jsonify({'students': []}), 200
        student = Student.query.get(user.student_id)
        return jsonify({'students': [student.to_json()] if student else []}), 200

    students = Student.query.all()
    return jsonify({'students': [s.to_json() for s in students]}), 200


@app.route('/students/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student(student_id):
    user = get_current_user()
    if user.role == 'student' and user.student_id != student_id:
        return jsonify({'error': 'Forbidden'}), 403

    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    return jsonify({'student': student.to_json()}), 200


@app.route('/students/<int:student_id>', methods=['DELETE'])
@jwt_required()
def delete_student(student_id):
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    # Delete linked user account
    User.query.filter_by(student_id=student_id).delete()
    db.session.delete(student)
    db.session.commit()
    return jsonify({'message': 'Student deleted'}), 200


@app.route('/students/<int:student_id>', methods=['PATCH'])
@jwt_required()
def update_student(student_id):
    user = get_current_user()
    is_admin = user.role == 'admin'

    if user.role == 'student' and user.student_id != student_id:
        return jsonify({'error': 'Forbidden'}), 403

    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    data = request.get_json()

    # Students can only update certain fields
    allowed_student_fields = ['phone', 'address', 'email']
    admin_only_fields = ['regno', 'cgpa', 'year', 'semester', 'age', 'department', 'name']

    for field in admin_only_fields:
        if field in data:
            if not is_admin:
                return jsonify({'error': f'Field "{field}" can only be updated by admin'}), 403
            setattr(student, field, data[field])

    for field in allowed_student_fields:
        if field in data:
            setattr(student, field, data[field])

    db.session.commit()
    return jsonify({'message': 'Student updated', 'student': student.to_json()}), 200


# ─── Attendance ───────────────────────────────────────────────────────────────

@app.route('/students/<int:student_id>/attendance', methods=['GET'])
@jwt_required()
def get_attendance(student_id):
    user = get_current_user()
    if user.role == 'student' and user.student_id != student_id:
        return jsonify({'error': 'Forbidden'}), 403

    records = Attendance.query.filter_by(student_id=student_id).order_by(Attendance.date.desc()).all()
    
    # Group by subject
    by_subject = {}
    for r in records:
        if r.subject_code not in by_subject:
            by_subject[r.subject_code] = {'present': 0, 'absent': 0, 'records': []}
        by_subject[r.subject_code][r.status] += 1
        by_subject[r.subject_code]['records'].append(r.to_json())

    summary = []
    for code, data in by_subject.items():
        total = data['present'] + data['absent']
        summary.append({
            'subject_code': code,
            'present': data['present'],
            'absent': data['absent'],
            'total': total,
            'percentage': round((data['present'] / total) * 100, 1) if total else 0,
            'records': data['records']
        })

    return jsonify({'attendance': summary}), 200


@app.route('/students/<int:student_id>/attendance', methods=['POST'])
@jwt_required()
def mark_attendance(student_id):
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    records = data.get('records', [])

    for rec in records:
        subject_code = rec.get('subject_code')
        date_str = rec.get('date')
        status = rec.get('status')

        if not all([subject_code, date_str, status]):
            return jsonify({'error': 'Missing fields in attendance record'}), 400

        rec_date = date.fromisoformat(date_str)

        # Upsert
        existing = Attendance.query.filter_by(
            student_id=student_id, subject_code=subject_code, date=rec_date
        ).first()
        if existing:
            existing.status = status
        else:
            db.session.add(Attendance(
                student_id=student_id, subject_code=subject_code,
                date=rec_date, status=status
            ))

    db.session.commit()
    return jsonify({'message': 'Attendance marked'}), 201


# ─── Subjects ────────────────────────────────────────────────────────────────

@app.route('/subjects', methods=['GET'])
@jwt_required()
def get_subjects():
    subjects = Subject.query.all()
    return jsonify({'subjects': [s.to_json() for s in subjects]}), 200


@app.route('/subjects', methods=['POST'])
@jwt_required()
def create_subject():
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    code = data.get('code')
    name = data.get('name')
    if not code or not name:
        return jsonify({'error': 'Code and name required'}), 400

    if Subject.query.filter_by(code=code).first():
        return jsonify({'error': f'Subject {code} already exists'}), 400

    subject = Subject(
        code=code, name=name,
        department=data.get('department'),
        credits=int(data.get('credits', 3)),
        year=data.get('year'),
        semester=str(data.get('semester', ''))
    )
    db.session.add(subject)
    db.session.commit()
    return jsonify({'message': 'Subject created', 'subject': subject.to_json()}), 201


@app.route('/subjects/<int:subject_id>', methods=['DELETE'])
@jwt_required()
def delete_subject(subject_id):
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404
    db.session.delete(subject)
    db.session.commit()
    return jsonify({'message': 'Subject deleted'}), 200


# ─── Enrollments ─────────────────────────────────────────────────────────────

@app.route('/students/<int:student_id>/enrollments', methods=['GET'])
@jwt_required()
def get_enrollments(student_id):
    user = get_current_user()
    if user.role == 'student' and user.student_id != student_id:
        return jsonify({'error': 'Forbidden'}), 403

    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    return jsonify({'enrollments': [e.to_json() for e in enrollments]}), 200


@app.route('/students/<int:student_id>/enrollments', methods=['POST'])
@jwt_required()
def enroll_student(student_id):
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    subject_id = data.get('subject_id')

    if Enrollment.query.filter_by(student_id=student_id, subject_id=subject_id).first():
        return jsonify({'error': 'Already enrolled'}), 400

    enrollment = Enrollment(student_id=student_id, subject_id=int(subject_id))
    db.session.add(enrollment)
    db.session.commit()
    return jsonify({'message': 'Enrolled', 'enrollment': enrollment.to_json()}), 201


@app.route('/students/<int:student_id>/enrollments/<int:enrollment_id>', methods=['DELETE'])
@jwt_required()
def unenroll_student(student_id, enrollment_id):
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    e = Enrollment.query.filter_by(id=enrollment_id, student_id=student_id).first()
    if not e:
        return jsonify({'error': 'Enrollment not found'}), 404
    db.session.delete(e)
    db.session.commit()
    return jsonify({'message': 'Unenrolled'}), 200


@app.route('/students/<int:student_id>/enrollments/<int:enrollment_id>/grade', methods=['PATCH'])
@jwt_required()
def update_grade(student_id, enrollment_id):
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    e = Enrollment.query.filter_by(id=enrollment_id, student_id=student_id).first()
    if not e:
        return jsonify({'error': 'Enrollment not found'}), 404

    data = request.get_json()
    e.grade = data.get('grade')
    db.session.commit()
    return jsonify({'message': 'Grade updated', 'enrollment': e.to_json()}), 200


# ─── Completed Courses ────────────────────────────────────────────────────────

@app.route('/students/<int:student_id>/completed-courses', methods=['GET'])
@jwt_required()
def get_completed_courses(student_id):
    user = get_current_user()
    if user.role == 'student' and user.student_id != student_id:
        return jsonify({'error': 'Forbidden'}), 403

    courses = CompletedCourse.query.filter_by(student_id=student_id).order_by(
        CompletedCourse.completion_date.desc()
    ).all()
    return jsonify({'completed_courses': [c.to_json() for c in courses]}), 200


@app.route('/students/<int:student_id>/completed-courses', methods=['POST'])
@jwt_required()
def add_completed_course(student_id):
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    course_name = data.get('course_name')
    completion_date = data.get('completion_date')

    if not course_name or not completion_date:
        return jsonify({'error': 'course_name and completion_date required'}), 400

    course = CompletedCourse(
        student_id=student_id,
        course_name=course_name,
        completion_date=date.fromisoformat(completion_date),
        grade=data.get('grade'),
        credits=int(data.get('credits', 3)),
        certificate_url=data.get('certificate_url')
    )
    db.session.add(course)
    db.session.commit()
    return jsonify({'message': 'Course added', 'course': course.to_json()}), 201


@app.route('/students/<int:student_id>/completed-courses/<int:course_id>', methods=['DELETE'])
@jwt_required()
def delete_completed_course(student_id, course_id):
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    course = CompletedCourse.query.filter_by(id=course_id, student_id=student_id).first()
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    db.session.delete(course)
    db.session.commit()
    return jsonify({'message': 'Course deleted'}), 200


# ─── Admin user management ────────────────────────────────────────────────────

@app.route('/admin/users', methods=['GET'])
@jwt_required()
def get_users():
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    users = User.query.all()
    return jsonify({'users': [u.to_json() for u in users]}), 200


@app.route('/admin/users', methods=['POST'])
@jwt_required()
def create_user():
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'student')
    student_id = data.get('student_id')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=pw_hash, role=role, student_id=student_id)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created', 'user': new_user.to_json()}), 201


@app.route('/admin/reset-password/<int:user_id>', methods=['PATCH'])
@jwt_required()
def reset_password(user_id):
    current = get_current_user()
    if not current or current.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    new_password = data.get('password')
    if not new_password:
        return jsonify({'error': 'Password required'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    return jsonify({'message': 'Password reset'}), 200


# ─── Dashboard stats ──────────────────────────────────────────────────────────

@app.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def dashboard_stats():
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    students = Student.query.all()
    total = len(students)
    avg_cgpa = round(sum(float(s.cgpa) for s in students) / total, 2) if total else 0
    final_year = sum(1 for s in students if s.year == 4)
    total_subjects = Subject.query.count()
    total_enrollments = Enrollment.query.count()

    return jsonify({
        'total_students': total,
        'avg_cgpa': avg_cgpa,
        'final_year_students': final_year,
        'total_subjects': total_subjects,
        'total_enrollments': total_enrollments,
    }), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Seed default admin if none exists
        if not User.query.filter_by(role='admin').first():
            pw = bcrypt.generate_password_hash('admin123').decode('utf-8')
            admin = User(username='admin', password_hash=pw, role='admin')
            db.session.add(admin)
            db.session.commit()
            print("Default admin created: admin / admin123")
    app.run(debug=True)