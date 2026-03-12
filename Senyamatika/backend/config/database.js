const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database connection
const dbPath = path.join(__dirname, '..', 'senyamatika.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite database:', err);
    process.exit(-1);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Query helper function (compatible with PostgreSQL style)
const query = async (text, params = []) => {
  const start = Date.now();
  
  return new Promise((resolve, reject) => {
    // Check if query has RETURNING clause
    const hasReturning = /RETURNING/i.test(text);
    const returningMatch = text.match(/RETURNING\s+(.+?)(?:;|$)/i);
    const returningColumns = returningMatch ? returningMatch[1].trim().split(',').map(c => c.trim()) : ['*'];
    
    // Convert PostgreSQL syntax to SQLite
    let sqliteQuery = text
      .replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/VARCHAR\(\d+\)/g, 'TEXT')
      .replace(/TIMESTAMP/g, 'DATETIME')
      .replace(/CURRENT_TIMESTAMP/g, "datetime('now')")
      .replace(/BOOLEAN/g, 'INTEGER')
      .replace(/TRUE/g, '1')
      .replace(/FALSE/g, '0')
      .replace(/RETURNING\s+.+?(?:;|$)/gi, '') // Remove RETURNING clause
      .replace(/ON CONFLICT DO NOTHING/gi, 'ON CONFLICT DO NOTHING');
    
    // Replace $1, $2, $3... with ?
    sqliteQuery = sqliteQuery.replace(/\$\d+/g, '?');

    // Check query type
    const isSelect = sqliteQuery.trim().toUpperCase().startsWith('SELECT');
    const isInsert = sqliteQuery.trim().toUpperCase().startsWith('INSERT');
    const isUpdate = sqliteQuery.trim().toUpperCase().startsWith('UPDATE');
    
    if (isSelect) {
      db.all(sqliteQuery, params, (err, rows) => {
        const duration = Date.now() - start;
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          console.log('Executed query', { duration, rows: rows.length });
          resolve({ rows, rowCount: rows.length });
        }
      });
    } else if (isInsert && hasReturning) {
      // Handle INSERT with RETURNING
      db.run(sqliteQuery, params, function(err) {
        const duration = Date.now() - start;
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          console.log('Executed query', { duration, rows: this.changes });
          // Get the inserted row
          if (this.lastID) {
            // Extract table name from INSERT query
            const tableMatch = sqliteQuery.match(/INSERT\s+INTO\s+(\w+)/i);
            const tableName = tableMatch ? tableMatch[1] : 'users';
            const selectColumns = returningColumns.join(', ');
            
            db.get(`SELECT ${selectColumns} FROM ${tableName} WHERE id = ?`, [this.lastID], (err, row) => {
              if (err) {
                console.error('Error fetching inserted row:', err);
                resolve({ rows: [], rowCount: this.changes, lastID: this.lastID });
              } else {
                resolve({ rows: row ? [row] : [], rowCount: this.changes, lastID: this.lastID });
              }
            });
          } else {
            resolve({ rows: [], rowCount: this.changes });
          }
        }
      });
    } else {
      db.run(sqliteQuery, params, function(err) {
        const duration = Date.now() - start;
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          console.log('Executed query', { duration, rows: this.changes });
          resolve({ rows: [], rowCount: this.changes, lastID: this.lastID });
        }
      });
    }
  });
};

// Initialize database tables
const initDatabase = async () => {
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        school TEXT,
        section TEXT,
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now'))
      )
    `);

    // User progress table
    await query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        topic TEXT NOT NULL,
        lesson_id TEXT,
        score INTEGER DEFAULT 0,
        max_score INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, topic, lesson_id)
      )
    `);

    // Admins table
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id)
      )
    `);

    // User sessions table (for tracking logins)
    await query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        device_info TEXT,
        ip_address TEXT,
        last_active DATETIME DEFAULT (datetime('now')),
        created_at DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_progress_topic ON user_progress(topic)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)`);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  query,
  db,
  initDatabase
};
