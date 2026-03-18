import express from 'express';
import db from '../db/connection.js';
import { ApiResponse } from '../types/index.js';
import { createObjectCsvWriter } from 'csv-writer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Generate CSV report for teacher
router.get('/teacher/:teacherId/csv', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Get report data - simplified for SQLite
    const reportData = db.prepare(`
      SELECT 
        s.name as student_name,
        c.grade,
        c.section,
        l.title as lesson_title,
        l.category,
        COUNT(DISTINCT CASE WHEN sp.completed = 1 THEN sp.subtopic_id END) as completed_subtopics,
        COUNT(DISTINCT st.id) as total_subtopics,
        ROUND(
          (COUNT(DISTINCT CASE WHEN sp.completed = 1 THEN sp.subtopic_id END) * 1.0 / 
          NULLIF(COUNT(DISTINCT st.id), 0)) * 100, 2
        ) as completion_rate,
        COALESCE(asc.score, 0) as assessment_score,
        asc.max_score,
        ROUND((asc.score * 1.0 / NULLIF(asc.max_score, 1)) * 100, 2) as assessment_percentage,
        MAX(sp.completed_at) as last_accessed
      FROM students s
      JOIN classes c ON s.class_id = c.id
      CROSS JOIN lessons l
      LEFT JOIN subtopics st ON l.id = st.lesson_id
      LEFT JOIN student_progress sp ON s.id = sp.student_id AND st.id = sp.subtopic_id
      LEFT JOIN assessments a ON l.id = a.lesson_id
      LEFT JOIN assessment_scores asc ON s.id = asc.student_id AND a.id = asc.assessment_id
      WHERE c.teacher_id = ?
      GROUP BY s.id, s.name, c.grade, c.section, l.id, l.title, l.category, asc.score, asc.max_score
      ORDER BY s.name, l.order_num
    `).all(teacherId);

    // Create CSV
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `teacher_report_${timestamp}.csv`;
    const filepath = path.join(process.cwd(), 'temp', filename);

    // Ensure temp directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'temp'));
    }

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'student_name', title: 'Student Name' },
        { id: 'grade', title: 'Grade' },
        { id: 'section', title: 'Section' },
        { id: 'lesson_title', title: 'Lesson' },
        { id: 'category', title: 'Category' },
        { id: 'completion_rate', title: 'Completion Rate (%)' },
        { id: 'assessment_percentage', title: 'Assessment Score (%)' },
        { id: 'last_accessed', title: 'Last Accessed' }
      ]
    });

    await csvWriter.writeRecords(reportData);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up file after download
      fs.unlinkSync(filepath);
    });
  } catch (error) {
    console.error('Error generating CSV report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate CSV report'
    } as ApiResponse);
  }
});

// Generate PDF report for teacher
router.get('/teacher/:teacherId/pdf', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Get teacher info
    const teacher = db.prepare('SELECT first_name, last_name, email FROM teachers WHERE id = ?').get(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      } as ApiResponse);
    }

    // Get summary stats
    const stats = db.prepare(`
      SELECT 
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT CASE WHEN sp.completed = 1 THEN sp.lesson_id END) as completed_lessons,
        ROUND(AVG((asc.score * 1.0 / asc.max_score) * 100), 2) as avg_score
      FROM students s
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN student_progress sp ON s.id = sp.student_id
      LEFT JOIN assessment_scores asc ON s.id = asc.student_id
      WHERE c.teacher_id = ?
    `).get(teacherId) as { total_students: number; completed_lessons: number; avg_score: number | null } | undefined;

    if (!stats) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate report statistics'
      } as ApiResponse);
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `teacher_report_${timestamp}.pdf`;
    const filepath = path.join(process.cwd(), 'temp', filename);

    // Ensure temp directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'temp'));
    }

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('SenyamatiKard Teacher Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Teacher: ${teacher.first_name} ${teacher.last_name}`);
    doc.text(`Email: ${teacher.email}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Summary Stats
    doc.fontSize(16).text('Summary Statistics', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Total Students: ${stats.total_students}`);
    doc.text(`Completed Lessons: ${stats.completed_lessons}`);
    doc.text(`Average Assessment Score: ${stats.avg_score || 0}%`);
    doc.moveDown();

    // Student Details
    const students = db.prepare(`
      SELECT 
        s.name,
        c.grade,
        c.section,
        COUNT(DISTINCT CASE WHEN sp.completed = 1 THEN sp.lesson_id END) as completed_lessons,
        (SELECT COUNT(*) FROM lessons) as total_lessons,
        ROUND(AVG((asc.score * 1.0 / asc.max_score) * 100), 2) as avg_score
      FROM students s
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN student_progress sp ON s.id = sp.student_id
      LEFT JOIN assessment_scores asc ON s.id = asc.student_id
      WHERE c.teacher_id = ?
      GROUP BY s.id, s.name, c.grade, c.section
      ORDER BY s.name
    `).all(teacherId);

    doc.fontSize(16).text('Student Progress', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);

    students.forEach((student, index) => {
      if (index > 0 && index % 15 === 0) {
        doc.addPage();
      }
      doc.text(`${student.name} (${student.grade} ${student.section})`);
      doc.text(`  Lessons: ${student.completed_lessons}/${student.total_lessons} | Avg Score: ${student.avg_score || 0}%`);
      doc.moveDown(0.3);
    });

    doc.end();

    stream.on('finish', () => {
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        // Clean up file after download
        fs.unlinkSync(filepath);
      });
    });
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF report'
    } as ApiResponse);
  }
});

// Generate CSV report for admin
router.get('/admin/csv', async (req, res) => {
  try {
    const reportData = db.prepare(`
      SELECT 
        (t.first_name || ' ' || t.last_name) as teacher_name,
        t.employee_id,
        t.email,
        sc.name as school_name,
        c.grade,
        c.section,
        COUNT(DISTINCT s.id) as student_count,
        COUNT(DISTINCT CASE WHEN sp.completed = 1 THEN sp.lesson_id END) as completed_lessons,
        ROUND(AVG((asc.score * 1.0 / asc.max_score) * 100), 2) as avg_assessment_score
      FROM teachers t
      LEFT JOIN classes c ON t.id = c.teacher_id
      LEFT JOIN schools sc ON c.school_id = sc.id
      LEFT JOIN students s ON c.id = s.class_id
      LEFT JOIN student_progress sp ON s.id = sp.student_id
      LEFT JOIN assessment_scores asc ON s.id = asc.student_id
      GROUP BY t.id, t.first_name, t.last_name, t.employee_id, t.email, sc.name, c.grade, c.section
      ORDER BY t.last_name, t.first_name
    `).all();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `admin_report_${timestamp}.csv`;
    const filepath = path.join(process.cwd(), 'temp', filename);

    if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'temp'));
    }

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'teacher_name', title: 'Teacher Name' },
        { id: 'employee_id', title: 'Employee ID' },
        { id: 'email', title: 'Email' },
        { id: 'school_name', title: 'School' },
        { id: 'grade', title: 'Grade' },
        { id: 'section', title: 'Section' },
        { id: 'student_count', title: 'Students' },
        { id: 'completed_lessons', title: 'Completed Lessons' },
        { id: 'avg_assessment_score', title: 'Avg Score (%)' }
      ]
    });

    await csvWriter.writeRecords(reportData);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      fs.unlinkSync(filepath);
    });
  } catch (error) {
    console.error('Error generating admin CSV report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate CSV report'
    } as ApiResponse);
  }
});

export default router;
