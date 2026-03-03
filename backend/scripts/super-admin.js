const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);
const SALT_ROUNDS = 10;

async function createSuperAdmin() {
  try {
    const password = await bcrypt.hash('superadmin123', SALT_ROUNDS);
    
    db.run(
      `INSERT OR IGNORE INTO users 
       (username, email, password, role, area_id, email_verified) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['superadmin', 'superadmin@example.com', password, 'admin', null, 1],
      function(err) {
        if (err) {
          console.error('❌ Error creating super admin:', err.message);
        } else if (this.changes > 0) {
          console.log('✅ Super admin created successfully!');
          console.log('   Username: superadmin');
          console.log('   Password: superadmin123');
          console.log('   Note: This admin has no area restriction and can manage all areas.');
        } else {
          console.log('ℹ️ Super admin already exists');
        }
      }
    );
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createSuperAdmin();

setTimeout(() => {
  db.close();
}, 1000);