import db from './connection.js';

// Helper to convert SQLite results to PostgreSQL-like format
export function query(sql: string, params: any[] = []) {
  try {
    // Check if it's a SELECT query
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const stmt = db.prepare(sql);
      const rows = stmt.all(...params);
      return { rows };
    } else {
      // INSERT, UPDATE, DELETE
      const stmt = db.prepare(sql);
      const info = stmt.run(...params);
      return { rows: [], rowCount: info.changes, lastID: info.lastInsertRowid };
    }
  } catch (error) {
    console.error('Query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

// Helper for transactions
export function transaction(callback: () => void) {
  const trans = db.transaction(callback);
  return trans();
}

export default { query, transaction };
