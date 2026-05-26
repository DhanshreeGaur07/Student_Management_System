from config import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')  # 'admin' or 'student'
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'student_id': self.student_id
        }

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    regno = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    cgpa = db.Column(db.String(10), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    semester = db.Column(db.String(10), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    department = db.Column(db.String(100), nullable=True)
    address = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    attendance_records = db.relationship('Attendance', backref='student', lazy=True, cascade='all, delete-orphan')
    enrollments = db.relationship('Enrollment', backref='student', lazy=True, cascade='all, delete-orphan')
    completed_courses = db.relationship('CompletedCourse', backref='student', lazy=True, cascade='all, delete-orphan')

    def to_json(self):
        attendance_pct = self._calc_attendance()
        return {
            'id': self.id,
            'regno': self.regno,
            'name': self.name,
            'age': self.age,
            'cgpa': self.cgpa,
            'year': self.year,
            'semester': self.semester,
            'email': self.email,
            'phone': self.phone,
            'department': self.department,
            'address': self.address,
            'attendance_percentage': attendance_pct,
            'subjects_enrolled': len(self.enrollments),
            'courses_completed': len(self.completed_courses),
        }

    def _calc_attendance(self):
        records = self.attendance_records
        if not records:
            return 0.0
        present = sum(1 for r in records if r.status == 'present')
        return round((present / len(records)) * 100, 1)

    def __repr__(self):
        return f"<Student {self.regno} - {self.name}>"


class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    subject_code = db.Column(db.String(20), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10), nullable=False)  # 'present' or 'absent'

    def to_json(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'subject_code': self.subject_code,
            'date': self.date.isoformat(),
            'status': self.status,
        }


class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=True)
    credits = db.Column(db.Integer, nullable=False, default=3)
    year = db.Column(db.Integer, nullable=True)
    semester = db.Column(db.String(10), nullable=True)

    def to_json(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'department': self.department,
            'credits': self.credits,
            'year': self.year,
            'semester': self.semester,
        }


class Enrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    enrolled_on = db.Column(db.DateTime, default=datetime.utcnow)
    grade = db.Column(db.String(5), nullable=True)

    subject = db.relationship('Subject', backref='enrollments', lazy=True)

    def to_json(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'subject': self.subject.to_json() if self.subject else None,
            'enrolled_on': self.enrolled_on.isoformat(),
            'grade': self.grade,
        }


class CompletedCourse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    course_name = db.Column(db.String(150), nullable=False)
    completion_date = db.Column(db.Date, nullable=False)
    grade = db.Column(db.String(5), nullable=True)
    credits = db.Column(db.Integer, nullable=False, default=3)
    certificate_url = db.Column(db.String(255), nullable=True)

    def to_json(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'course_name': self.course_name,
            'completion_date': self.completion_date.isoformat(),
            'grade': self.grade,
            'credits': self.credits,
            'certificate_url': self.certificate_url,
        }