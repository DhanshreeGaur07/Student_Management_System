from flask import request, jsonify
from config import app, db
from models import Student


# Adding new Students

@app.route('/students', methods=['POST'])
def add_students():
    data = request.get_json()
    students = data.get('students', [])

    for student_data in students:
        regno = student_data.get('regno')
        name = student_data.get('name')
        age = student_data.get('age')
        cgpa = student_data.get('cgpa')
        year = student_data.get('year')
        semester = student_data.get('semester')

        if not all([regno, name, age, cgpa, year, semester]):
            return jsonify({'error': 'Missing required fields'}), 400

        existing_student = Student.query.filter_by(regno=regno).first()
        if existing_student:
            return jsonify({'error': f'Student with regno {regno} already exists'}), 400

        new_student = Student(
            regno=regno,
            name=name,
            age=age,
            cgpa=cgpa,
            year=year,
            semester=semester
        )
        db.session.add(new_student)

    db.session.commit()
    return jsonify({'message': 'Students added successfully'}), 201


# Accessing desired Student Details

@app.route('/students', methods=['GET'])
def get_students():
    students = Student.query.all()
    return jsonify({'students': [student.to_json() for student in students]}), 200


# Deleting a Student Record

@app.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    db.session.delete(student)
    db.session.commit()
    return jsonify({'message': 'Student deleted successfully'}), 200


# Updating a Student Record

@app.route('/students/<int:student_id>', methods=['PATCH'])
def update_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    data = request.get_json()
    regno = data.get('regno')
    name = data.get('name')
    age = data.get('age')
    cgpa = data.get('cgpa')
    year = data.get('year')
    semester = data.get('semester')

    if regno:
        existing_student = Student.query.filter_by(regno=regno).first()
        if existing_student and existing_student.id != student_id:
            return jsonify({'error': f'Student with regno {regno} already exists'}), 400
        student.regno = regno
    if name:
        student.name = name
    if age:
        student.age = age
    if cgpa:
        student.cgpa = cgpa
    if year:
        student.year = year
    if semester:
        student.semester = semester

    db.session.commit()
    return jsonify({'message': 'Student updated successfully'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
