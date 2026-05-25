import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

const emptyForm = {
  regno: '',
  name: '',
  age: '',
  cgpa: '',
  year: '',
  semester: '',
}

const yearOptions = [1, 2, 3, 4]
const semesterOptions = ['1', '2', '3', '4', '5', '6', '7', '8']

function App() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isEditing = editingId !== null

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/students`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not load student records')
      }

      setStudents(data.students || [])
      setStatus({ type: 'idle', message: '' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: `${error.message}. Check that the Flask backend is running on ${API_URL}.`,
      })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function validateForm() {
    const age = Number(form.age)
    const cgpa = Number(form.cgpa)
    const year = Number(form.year)

    if (Object.values(form).some((value) => String(value).trim() === '')) {
      return 'Please complete every field before saving.'
    }

    if (!Number.isInteger(age) || age < 15 || age > 80) {
      return 'Age must be a whole number between 15 and 80.'
    }

    if (Number.isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      return 'CGPA must be between 0 and 10.'
    }

    if (!Number.isInteger(year) || year < 1 || year > 4) {
      return 'Year must be between 1 and 4.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationMessage = validateForm()
    if (validationMessage) {
      setStatus({ type: 'error', message: validationMessage })
      return
    }

    const payload = {
      ...form,
      age: Number(form.age),
      year: Number(form.year),
      cgpa: String(form.cgpa),
      semester: String(form.semester),
    }

    try {
      setSaving(true)
      const response = await fetch(
        isEditing ? `${API_URL}/students/${editingId}` : `${API_URL}/students`,
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isEditing ? payload : { students: [payload] }),
        },
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save student')
      }

      setStatus({
        type: 'success',
        message: isEditing ? 'Student record updated.' : 'New student added.',
      })
      resetForm()
      await fetchStudents()
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(student) {
    const confirmed = window.confirm(
      `Delete ${student.name} (${student.regno}) from the records?`,
    )

    if (!confirmed) return

    try {
      const response = await fetch(`${API_URL}/students/${student.id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete student')
      }

      if (editingId === student.id) resetForm()
      setStatus({ type: 'success', message: 'Student record deleted.' })
      await fetchStudents()
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    }
  }

  function startEdit(student) {
    setEditingId(student.id)
    setForm({
      regno: student.regno,
      name: student.name,
      age: String(student.age),
      cgpa: String(student.cgpa),
      year: String(student.year),
      semester: String(student.semester),
    })
    setStatus({ type: 'idle', message: '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
  }

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()

    return students
      .filter((student) => {
        if (!query) return true
        return [student.name, student.regno, student.year, student.semester]
          .join(' ')
          .toLowerCase()
          .includes(query)
      })
      .sort((a, b) => {
        if (sortBy === 'cgpa') return Number(b.cgpa) - Number(a.cgpa)
        if (sortBy === 'year') return Number(a.year) - Number(b.year)
        if (sortBy === 'regno') return a.regno.localeCompare(b.regno)
        return a.name.localeCompare(b.name)
      })
  }, [students, search, sortBy])

  const stats = useMemo(() => {
    const total = students.length
    const averageCgpa =
      total === 0
        ? '0.00'
        : (
            students.reduce((sum, student) => sum + Number(student.cgpa || 0), 0) /
            total
          ).toFixed(2)
    const finalYear = students.filter((student) => Number(student.year) === 4).length

    return { total, averageCgpa, finalYear }
  }, [students])

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Dashboard summary">
        <div>
          <p className="eyebrow">Student Management System</p>
          <h1>Manage student records with clarity.</h1>
        </div>
        <button className="refresh-button" type="button" onClick={fetchStudents}>
          <span aria-hidden="true">↻</span>
          Refresh
        </button>
      </section>

      <section className="stats-grid" aria-label="Student statistics">
        <article>
          <span>Total Students</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Average CGPA</span>
          <strong>{stats.averageCgpa}</strong>
        </article>
        <article>
          <span>Final Year</span>
          <strong>{stats.finalYear}</strong>
        </article>
      </section>

      <section className="workspace">
        <aside className="form-panel">
          <div className="panel-heading">
            <p className="eyebrow">{isEditing ? 'Update Record' : 'New Record'}</p>
            <h2>{isEditing ? 'Edit student' : 'Add student'}</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Register number
              <input
                name="regno"
                value={form.regno}
                onChange={handleChange}
                placeholder="REG2026001"
              />
            </label>
            <label>
              Full name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ananya Sharma"
              />
            </label>

            <div className="field-row">
              <label>
                Age
                <input
                  name="age"
                  type="number"
                  min="15"
                  max="80"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="20"
                />
              </label>
              <label>
                CGPA
                <input
                  name="cgpa"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={form.cgpa}
                  onChange={handleChange}
                  placeholder="8.75"
                />
              </label>
            </div>

            <div className="field-row">
              <label>
                Year
                <select name="year" value={form.year} onChange={handleChange}>
                  <option value="">Select</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Semester
                <select
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  {semesterOptions.map((semester) => (
                    <option key={semester} value={semester}>
                      Sem {semester}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {status.message && (
              <p className={`status-message ${status.type}`}>{status.message}</p>
            )}

            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Add student'}
              </button>
              {isEditing && (
                <button className="ghost-button" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </aside>

        <section className="records-panel">
          <div className="records-toolbar">
            <div>
              <p className="eyebrow">Directory</p>
              <h2>Student records</h2>
            </div>
            <div className="tools">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, reg no, year..."
                />
              </label>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort students"
              >
                <option value="name">Sort by name</option>
                <option value="regno">Sort by reg no</option>
                <option value="cgpa">Sort by CGPA</option>
                <option value="year">Sort by year</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            {loading ? (
              <div className="empty-state">Loading student records...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state">
                {students.length === 0
                  ? 'No students yet. Add the first record to begin.'
                  : 'No records match your search.'}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Reg No</th>
                    <th>Age</th>
                    <th>Year</th>
                    <th>Semester</th>
                    <th>CGPA</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="student-cell">
                          <span>{student.name.slice(0, 1).toUpperCase()}</span>
                          <strong>{student.name}</strong>
                        </div>
                      </td>
                      <td>{student.regno}</td>
                      <td>{student.age}</td>
                      <td>Year {student.year}</td>
                      <td>Sem {student.semester}</td>
                      <td>
                        <span className="cgpa-pill">{student.cgpa}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button type="button" onClick={() => startEdit(student)}>
                            Edit
                          </button>
                          <button
                            className="danger"
                            type="button"
                            onClick={() => handleDelete(student)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
