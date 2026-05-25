from config import db

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    regno = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    cgpa = db.Column(db.String(10), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    semester = db.Column(db.String(10), nullable=False)


    def to_json(self):
        return {
            'id': self.id,
            'regno': self.regno,
            'name': self.name,
            'age': self.age,
            'cgpa': self.cgpa,
            'year': self.year,
            'semester': self.semester
        }

    def __repr__(self):
        return f"<Student {self.regno} - {self.name}>"
