const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

// Initialize database with all tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    contact_number TEXT UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    area_id INTEGER,
    email_verified BOOLEAN DEFAULT 0,
    contact_verified BOOLEAN DEFAULT 0,
    verification_code TEXT,
    verification_expires DATETIME,
    reset_token TEXT,
    reset_token_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES areas (id)
  )`);

  // Areas table
  db.run(`CREATE TABLE IF NOT EXISTS areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('estate', 'municipality', 'complex')) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Issues table
  db.run(`CREATE TABLE IF NOT EXISTS issues (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    user_id INTEGER,
    area_id INTEGER,
    status TEXT DEFAULT 'pending',
    street_address TEXT NOT NULL,
    issue_date DATE NOT NULL,
    issue_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (area_id) REFERENCES areas (id)
  )`);

  // Votes table
  db.run(`CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    issue_id INTEGER,
    user_id INTEGER,
    vote_type TEXT CHECK(vote_type IN ('approve', 'reject')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(issue_id, user_id),
    FOREIGN KEY (issue_id) REFERENCES issues (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Password resets table
  db.run(`CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  console.log('✅ All tables created');

  // Check if areas table is empty and insert sample data
  db.get("SELECT COUNT(*) as count FROM areas", (err, row) => {
    if (err) {
      console.error('Error checking areas:', err);
    } else if (row.count === 0) {
      console.log('Inserting sample areas...');
      
      const sampleAreas = [
        ['Sunnyvale Estate', 'estate', 'Luxury residential estate with 500 homes'],
        ['Green Meadows', 'estate', 'Family-friendly estate with park'],
        ['Oak Ridge', 'estate', 'Secure estate with 24/7 security'],
        ['City of Johannesburg', 'municipality', 'Metropolitan municipality'],
        ['City of Tshwane', 'municipality', 'Metropolitan municipality'],
        ['Ekurhuleni', 'municipality', 'East Rand metropolitan area'],
        ['Parkview Apartments', 'complex', 'Modern apartment complex'],
        ['Harbour View', 'complex', 'Beachfront apartment complex'],
        ['Mountain Ridge', 'complex', 'Townhouse complex with mountain views']
      ];

      const stmt = db.prepare('INSERT INTO areas (name, type, description) VALUES (?, ?, ?)');
      sampleAreas.forEach(area => {
        stmt.run(area, (err) => {
          if (err) console.error('Error inserting area:', err);
        });
      });
      stmt.finalize();
      console.log('✅ Sample areas inserted');
    }
  });

  console.log('✅ Database initialized with all tables');
});

// Add error handler
db.on('error', (err) => {
  console.error('Database error:', err);
});

module.exports = db;