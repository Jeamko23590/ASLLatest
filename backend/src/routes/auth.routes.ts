import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/connection.js';
import { ApiResponse } from '../types/index.js';

const router = express.Router();

// Teacher Login
router.post('/teacher/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID and password are required'
      } as ApiResponse);
    }

    const teacher = db.prepare('SELECT * FROM teachers WHERE employee_id = ?').get(employeeId);

    if (!teacher) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      } as ApiResponse);
    }

    const isValidPassword = await bcrypt.compare(password, teacher.password as string);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      } as ApiResponse);
    }

    const token = jwt.sign(
      { id: teacher.id, role: 'teacher', employeeId: teacher.employee_id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    const teacherData: any = { ...teacher };
    delete teacherData.password;

    res.json({
      success: true,
      data: { token, user: teacherData }
    } as ApiResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' } as ApiResponse);
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse);
    }

    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);

    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' } as ApiResponse);
    }

    const isValidPassword = await bcrypt.compare(password, admin.password as string);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' } as ApiResponse);
    }

    const token = jwt.sign(
      { id: admin.id, role: 'admin', email: admin.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    const adminData: any = { ...admin };
    delete adminData.password;

    res.json({
      success: true,
      data: { token, user: adminData }
    } as ApiResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' } as ApiResponse);
  }
});

// Student Login (for APK)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse);
    }

    const student = db.prepare('SELECT * FROM students WHERE email = ?').get(email);

    if (!student) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' } as ApiResponse);
    }

    if (!student.password) {
      return res.status(401).json({
        success: false,
        error: 'Account not properly set up. Please contact administrator.'
      } as ApiResponse);
    }

    const isValidPassword = await bcrypt.compare(password, student.password as string);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' } as ApiResponse);
    }

    const token = jwt.sign(
      { id: student.id, role: 'student', email: student.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30d' }
    );

    delete student.password;

    res.json({
      success: true,
      data: { token, user: student }
    } as ApiResponse);
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' } as ApiResponse);
  }
});

// Student Registration (for APK)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, gender, school, section } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      } as ApiResponse);
    }

    const existingStudent = db.prepare('SELECT * FROM students WHERE email = ?').get(email);
    if (existingStudent) {
      return res.status(400).json({ success: false, error: 'Email already registered' } as ApiResponse);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Find class — support both "BSM CS-4B" and "4th Year - BSM CS-4B" formats
    let classId = null;
    if (school && section) {
      console.log(`Registration: school="${school}" section="${section}"`); // ← DEBUG LOG

      const classRecord = db.prepare(`
        SELECT c.id FROM classes c
        JOIN schools s ON c.school_id = s.id
        WHERE LOWER(REPLACE(s.name, '-', ' ')) = LOWER(REPLACE(?, '-', ' '))
        AND (
          c.section = ?
          OR c.grade || ' - ' || c.section = ?
          OR ? LIKE '%' || c.section
        )
      `).get(school, section, section, section);

      console.log(`Class found: ${classRecord ? (classRecord as any).id : 'NULL - walang nahanap!'}`); // ← DEBUG LOG

      if (classRecord) {
        classId = (classRecord as any).id;
      }
    }

    const studentId = Math.random().toString(36).substring(2, 15);

    db.prepare(`
      INSERT INTO students (id, name, email, password, gender, class_id, enrollment_date)
      VALUES (?, ?, ?, ?, ?, ?, date('now'))
    `).run(studentId, name, email, hashedPassword, gender || 'nonbinary', classId);

    const student = db.prepare('SELECT id, name, email, gender, class_id, enrollment_date FROM students WHERE id = ?').get(studentId) as any;

    if (!student) {
      return res.status(500).json({ success: false, error: 'Failed to create student account' } as ApiResponse);
    }

    const token = jwt.sign(
      { id: student.id, role: 'student', email: student.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      data: {
        studentId: student.id,
        token,
        user: student
      }
    } as ApiResponse);
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' } as ApiResponse);
  }
});

export default router;