import express from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db/query-helper.js';
import { ApiResponse, AdminDashboardStats, CreateTeacherRequest, UpdateTeacherRequest } from '../types/index.js';

const router = express.Router();

// Helper to generate UUID-like IDs
function generateId(): string {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// Get admin dashboard stats
router.get('/dashboard', (req, res) => {
  try {
    const teachersResult = query('SELECT COUNT(*) as count FROM teachers');
    const classesResult = query('SELECT COUNT(*) as count FROM classes');
    const lessonsResult = query('SELECT COUNT(*) as count FROM lessons');
    const studentsResult = query('SELECT COUNT(*) as count FROM students');
    const schoolsResult = query('SELECT COUNT(*) as count FROM schools');

    const stats: AdminDashboardStats = {
      totalTeachers: parseInt(teachersResult.rows[0].count),
      totalClasses: parseInt(classesResult.rows[0].count),
      totalLessons: parseInt(lessonsResult.rows[0].count),
      totalStudents: parseInt(studentsResult.rows[0].count),
      totalSchools: parseInt(schoolsResult.rows[0].count)
    };

    res.json({
      success: true,
      data: stats
    } as ApiResponse<AdminDashboardStats>);
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    } as ApiResponse);
  }
});

// Get all teachers
router.get('/teachers', (req, res) => {
  try {
    const result = query(`
      SELECT 
        t.id,
        t.first_name,
        t.last_name,
        t.middle_name,
        t.suffix,
        t.email,
        t.employee_id,
        t.gender,
        t.created_at,
        GROUP_CONCAT(c.id) as class_ids
      FROM teachers t
      LEFT JOIN classes c ON t.id = c.teacher_id
      GROUP BY t.id
      ORDER BY t.last_name, t.first_name
    `);

    // Convert class_ids from comma-separated string to array
    const teachers = result.rows.map((row: any) => ({
      ...row,
      class_ids: row.class_ids ? row.class_ids.split(',') : []
    }));

    res.json({
      success: true,
      data: teachers
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teachers'
    } as ApiResponse);
  }
});

// Create teacher
router.post('/teachers', async (req, res) => {
  try {
    const { firstName, lastName, middleName, suffix, email, employeeId, gender, classIds }: CreateTeacherRequest = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !employeeId || !gender) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      } as ApiResponse);
    }

    // Generate password: lastname_lastThreeCharsOfEmployeeID
    const lastThreeChars = employeeId.slice(-3);
    const password = `${lastName.toLowerCase()}_${lastThreeChars}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate ID
    const teacherId = generateId();

    // Insert teacher
    query(`
      INSERT INTO teachers (id, first_name, last_name, middle_name, suffix, email, employee_id, password, gender)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [teacherId, firstName, lastName, middleName || null, suffix || null, email, employeeId, hashedPassword, gender]);

    // Assign classes if provided
    if (classIds && classIds.length > 0) {
      classIds.forEach(classId => {
        query('UPDATE classes SET teacher_id = ? WHERE id = ?', [teacherId, classId]);
      });
    }

    const teacher = query('SELECT id, first_name, last_name, middle_name, suffix, email, employee_id, gender, created_at FROM teachers WHERE id = ?', [teacherId]);

    res.status(201).json({
      success: true,
      data: {
        teacher: teacher.rows[0],
        generatedPassword: password
      },
      message: 'Teacher created successfully'
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error creating teacher:', error);
    if (error.message && error.message.includes('UNIQUE')) {
      return res.status(400).json({
        success: false,
        error: 'Email or Employee ID already exists'
      } as ApiResponse);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create teacher'
    } as ApiResponse);
  }
});

// Update teacher
router.put('/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, middleName, suffix, email, employeeId, gender, classIds, resetPassword }: UpdateTeacherRequest = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (firstName) {
      updates.push('first_name = ?');
      values.push(firstName);
    }
    if (lastName) {
      updates.push('last_name = ?');
      values.push(lastName);
    }
    if (middleName !== undefined) {
      updates.push('middle_name = ?');
      values.push(middleName || null);
    }
    if (suffix !== undefined) {
      updates.push('suffix = ?');
      values.push(suffix || null);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (employeeId) {
      updates.push('employee_id = ?');
      values.push(employeeId);
    }
    if (gender) {
      updates.push('gender = ?');
      values.push(gender);
    }

    // Handle password reset
    let newPassword = null;
    if (resetPassword && lastName && employeeId) {
      const lastThreeChars = employeeId.slice(-3);
      newPassword = `${lastName.toLowerCase()}_${lastThreeChars}`;
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length > 0) {
      values.push(id);
      query(`UPDATE teachers SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    // Update class assignments if provided
    if (classIds !== undefined) {
      // Remove teacher from all classes first
      query('UPDATE classes SET teacher_id = NULL WHERE teacher_id = ?', [id]);
      
      // Assign new classes
      if (classIds.length > 0) {
        classIds.forEach(classId => {
          query('UPDATE classes SET teacher_id = ? WHERE id = ?', [id, classId]);
        });
      }
    }

    res.json({
      success: true,
      data: {
        ...(newPassword && { generatedPassword: newPassword })
      },
      message: 'Teacher updated successfully'
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error updating teacher:', error);
    if (error.message && error.message.includes('UNIQUE')) {
      return res.status(400).json({
        success: false,
        error: 'Email or Employee ID already exists'
      } as ApiResponse);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update teacher'
    } as ApiResponse);
  }
});

// Delete teacher
router.delete('/teachers/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Unassign classes first
    query('UPDATE classes SET teacher_id = NULL WHERE teacher_id = ?', [id]);

    // Delete teacher
    const result = query('DELETE FROM teachers WHERE id = ?', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Teacher deleted successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete teacher'
    } as ApiResponse);
  }
});

// Get all schools
router.get('/schools', (req, res) => {
  try {
    const result = query(`
      SELECT 
        s.id,
        s.name,
        s.address,
        s.created_at,
        COUNT(c.id) as class_count
      FROM schools s
      LEFT JOIN classes c ON s.id = c.school_id
      GROUP BY s.id
      ORDER BY s.name
    `);

    res.json({
      success: true,
      data: result.rows
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schools'
    } as ApiResponse);
  }
});

// Create school
router.post('/schools', (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'School name is required'
      } as ApiResponse);
    }

    const schoolId = generateId();
    query('INSERT INTO schools (id, name, address) VALUES (?, ?, ?)', [schoolId, name, address || null]);

    const result = query('SELECT * FROM schools WHERE id = ?', [schoolId]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'School created successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create school'
    } as ApiResponse);
  }
});

// Update school
router.put('/schools/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }

    if (updates.length > 0) {
      values.push(id);
      query(`UPDATE schools SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    const result = query('SELECT * FROM schools WHERE id = ?', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'School not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'School updated successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update school'
    } as ApiResponse);
  }
});

// Delete school
router.delete('/schools/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if school has classes
    const classCheck = query('SELECT COUNT(*) as count FROM classes WHERE school_id = ?', [id]);
    if (parseInt(classCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete school with existing classes'
      } as ApiResponse);
    }

    const result = query('DELETE FROM schools WHERE id = ?', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'School not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'School deleted successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete school'
    } as ApiResponse);
  }
});

// Get all classes
router.get('/classes', (req, res) => {
  try {
    const result = query(`
      SELECT 
        c.id,
        c.school_id,
        s.name as school_name,
        c.grade,
        c.section,
        c.teacher_id,
        (t.first_name || ' ' || t.last_name) as teacher_name,
        COUNT(st.id) as student_count,
        c.created_at
      FROM classes c
      JOIN schools s ON c.school_id = s.id
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN students st ON c.id = st.class_id
      GROUP BY c.id, s.name, t.first_name, t.last_name
      ORDER BY s.name, c.grade, c.section
    `);

    res.json({
      success: true,
      data: result.rows
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classes'
    } as ApiResponse);
  }
});

export default router;
