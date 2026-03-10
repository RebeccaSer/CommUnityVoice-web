// backend/scripts/mock-users.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);
const SALT_ROUNDS = 10;

async function insertMockUsers() {
  try {
    // Get areas
    const areas = await new Promise((resolve, reject) => {
      db.all("SELECT id, name FROM areas", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (areas.length === 0) {
      console.error('No areas found. Run mock-areas.js first.');
      return;
    }

    const adminPass = await bcrypt.hash('admin123', SALT_ROUNDS);
    const userPass = await bcrypt.hash('password123', SALT_ROUNDS);

    // Superadmin (no area)
    const superadmin = [
      'superadmin', 'super@admin.com', null, adminPass, 'admin', null, 1, 0
    ];

    // Area admins (one per area for first 5 areas as example)
    const areaAdmins = areas.slice(0,5).map((area, index) => [
      `admin_${area.name.toLowerCase().replace(/\s/g,'')}`,
      `admin_${area.name.toLowerCase().replace(/\s/g,'')}@example.com`,
      `+2773000000${index}`,
      adminPass,
      'admin',
      area.id,
      1,
      0
    ]);

    // Regular users assigned to areas
    const regularUsers = areas.slice(0,8).map((area, index) => [
      `user${index+1}`,
      `user${index+1}@example.com`,
      `+2774000000${index}`,
      userPass,
      'user',
      area.id,
      1,
      0
    ]);

    const allUsers = [superadmin, ...areaAdmins, ...regularUsers];

    const insertUser = (user) => {
      return new Promise((resolve, reject) => {
        db.run(
          `INSERT OR IGNORE INTO users 
           (username, email, contact_number, password, role, area_id, email_verified, contact_verified) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          user,
          function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          }
        );
      });
    };

    let inserted = 0;
    for (const user of allUsers) {
      try {
        const changes = await insertUser(user);
        if (changes > 0) {
          inserted++;
          console.log(`✅ Created: ${user[0]} (${user[4]}) area: ${user[5] || 'none'}`);
        }
      } catch (err) {
        console.error(`❌ Error creating ${user[0]}:`, err.message);
      }
    }
    console.log(`\n✅ Inserted ${inserted} users`);
  } catch (error) {
    console.error(error);
  } finally {
    db.close();
  }
}

insertMockUsers();