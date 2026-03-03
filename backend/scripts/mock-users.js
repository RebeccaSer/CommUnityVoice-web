const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);
const SALT_ROUNDS = 10;

console.log('='.repeat(50));
console.log('👥 MOCK USERS SCRIPT');
console.log('='.repeat(50));

async function insertMockUsers() {
  try {
    // Check if users table exists
    const tableCheck = await new Promise((resolve) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        resolve(!!row);
      });
    });

    if (!tableCheck) {
      console.error('❌ Users table does not exist!');
      console.error('   Please make sure your server has created the tables first.');
      console.error('   Run: npm start');
      db.close();
      return;
    }

    // Get existing areas
    const areas = await new Promise((resolve, reject) => {
      db.all("SELECT id, name FROM areas", (err, rows) => {
        if (err) {
          console.error('❌ Error fetching areas:', err.message);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });

    if (areas.length === 0) {
      console.error('❌ No areas found in database!');
      console.error('   Please run mock-areas.js first: npm run db:areas');
      db.close();
      return;
    }

    console.log(`\n📋 Found ${areas.length} areas in database`);
    console.log('   Available areas:');
    areas.slice(0, 5).forEach(area => {
      console.log(`   • ${area.id}: ${area.name}`);
    });
    if (areas.length > 5) console.log(`   • ... and ${areas.length - 5} more`);

    // Check existing users
    const existingUsers = await new Promise((resolve) => {
      db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        resolve(row?.count || 0);
      });
    });
    console.log(`\n📊 Existing users in database: ${existingUsers}`);

    // Create passwords
    console.log('\n🔐 Generating password hashes...');
    const adminPass = await bcrypt.hash('admin123', SALT_ROUNDS);
    const userPass = await bcrypt.hash('password123', SALT_ROUNDS);
    console.log('✅ Password hashes created');

    // Define users (ensure we have enough areas)
    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        contact: '+27721234567',
        password: adminPass,
        role: 'admin',
        area: areas[0] || { id: 1 },
        email_verified: 1,
        contact_verified: 0
      },
      {
        username: 'john',
        email: 'john@example.com',
        contact: '+27722345678',
        password: userPass,
        role: 'user',
        area: areas[1] || areas[0] || { id: 1 },
        email_verified: 1,
        contact_verified: 0
      },
      {
        username: 'jane',
        email: 'jane@example.com',
        contact: null,
        password: userPass,
        role: 'user',
        area: areas[2] || areas[0] || { id: 1 },
        email_verified: 1,
        contact_verified: 0
      },
      {
        username: 'peter',
        email: null,
        contact: '+27723456789',
        password: userPass,
        role: 'user',
        area: areas[3] || areas[0] || { id: 1 },
        email_verified: 0,
        contact_verified: 1
      },
      {
        username: 'sarah',
        email: 'sarah@example.com',
        contact: '+27724567890',
        password: userPass,
        role: 'user',
        area: areas[4] || areas[0] || { id: 1 },
        email_verified: 1,
        contact_verified: 0
      },
      {
        username: 'mike',
        email: 'mike@example.com',
        contact: '+27725678901',
        password: userPass,
        role: 'user',
        area: areas[5] || areas[0] || { id: 1 },
        email_verified: 1,
        contact_verified: 0
      }
    ];

    console.log(`\n📋 Preparing to insert ${users.length} users...\n`);

    const stmt = db.prepare(
      `INSERT OR IGNORE INTO users 
       (username, email, contact_number, password, role, area_id, email_verified, contact_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    let insertedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      await new Promise((resolve) => {
        stmt.run(
          [
            user.username,
            user.email,
            user.contact,
            user.password,
            user.role,
            user.area.id,
            user.email_verified,
            user.contact_verified
          ],
          function(err) {
            if (err) {
              console.error(`  ❌ Error creating ${user.username}:`, err.message);
            } else if (this.changes > 0) {
              insertedCount++;
              console.log(`  ✅ Created: ${user.username} (${user.role}) - Area ID: ${user.area.id}`);
            } else {
              skippedCount++;
              console.log(`  ⏭️  Already exists: ${user.username}`);
            }
            resolve();
          }
        );
      });
    }

    stmt.finalize();

    console.log('\n📊 USERS INSERTION SUMMARY:');
    console.log(`   ✅ New users created: ${insertedCount}`);
    console.log(`   ⏭️  Already existed: ${skippedCount}`);
    console.log(`   📝 Total attempted: ${users.length}`);

    console.log('\n👤 TEST USER CREDENTIALS:');
    console.log('   admin  - username: admin,  password: admin123');
    console.log('   john   - username: john,   password: password123');
    console.log('   jane   - username: jane,   password: password123');
    console.log('   peter  - username: peter,  password: password123');
    console.log('   sarah  - username: sarah,  password: password123');
    console.log('   mike   - username: mike,   password: password123');

  } catch (error) {
    console.error('❌ Error in mock users script:', error);
  }
}

insertMockUsers();

setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('\n✅ Database connection closed');
    }
  });
}, 2000);