const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('='.repeat(50));
console.log('📝 MOCK ISSUES SCRIPT');
console.log('='.repeat(50));

async function insertMockIssues() {
  try {
    // Check if issues table exists
    const tableCheck = await new Promise((resolve) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='issues'", (err, row) => {
        resolve(!!row);
      });
    });

    if (!tableCheck) {
      console.error('❌ Issues table does not exist!');
      console.error('   Please make sure your server has created the tables first.');
      console.error('   Run: npm start');
      db.close();
      return;
    }

    // Get users
    const users = await new Promise((resolve, reject) => {
      db.all("SELECT id, username FROM users", (err, rows) => {
        if (err) {
          console.error('❌ Error fetching users:', err.message);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });

    if (users.length === 0) {
      console.error('❌ No users found in database!');
      console.error('   Please run mock-users.js first: npm run db:users');
      db.close();
      return;
    }

    // Get areas
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

    console.log(`\n📋 Found ${users.length} users and ${areas.length} areas`);

    // Check existing issues
    const existingIssues = await new Promise((resolve) => {
      db.get("SELECT COUNT(*) as count FROM issues", (err, row) => {
        resolve(row?.count || 0);
      });
    });
    console.log(`📊 Existing issues in database: ${existingIssues}`);

    // Date calculations
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
    const lastMonth = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    // Create issues
    const issues = [
      // Admin's issues (Sunnyvale Estate)
      {
        user: users.find(u => u.username === 'admin') || users[0],
        area: areas[0],
        title: 'Broken street light on Main Road',
        description: 'The street light outside number 45 Main Road has been broken for over two weeks. The area is very dark at night and poses a safety risk.',
        address: '45 Main Road, Sunnyvale Estate',
        date: twoWeeksAgo,
        type: 'infrastructure',
        status: 'pending'
      },
      {
        user: users.find(u => u.username === 'admin') || users[0],
        area: areas[0],
        title: 'Pothole damaging vehicles',
        description: 'Large pothole at the intersection of Main and Oak. Already caused damage to two cars this week. Needs urgent repair.',
        address: 'Corner of Main and Oak, Sunnyvale Estate',
        date: yesterday,
        type: 'infrastructure',
        status: 'in-progress'
      },

      // John's issues (Green Meadows)
      {
        user: users.find(u => u.username === 'john') || users[1] || users[0],
        area: areas[1] || areas[0],
        title: 'Illegal dumping in park',
        description: 'Someone has been dumping construction waste in the children\'s park. There\'s broken tiles and rubble.',
        address: 'Green Meadows Community Park',
        date: yesterday,
        type: 'environmental',
        status: 'pending'
      },
      {
        user: users.find(u => u.username === 'john') || users[1] || users[0],
        area: areas[1] || areas[0],
        title: 'Broken playground equipment',
        description: 'The swings at the children\'s playground are broken. One swing fell down while a child was using it.',
        address: 'Green Meadows Playground',
        date: lastWeek,
        type: 'public_safety',
        status: 'in-progress'
      },

      // Jane's issues (Oak Ridge)
      {
        user: users.find(u => u.username === 'jane') || users[2] || users[0],
        area: areas[2] || areas[0],
        title: 'Security gate malfunction',
        description: 'The main entrance gate is getting stuck halfway. It sometimes closes on cars.',
        address: 'Main Entrance, Oak Ridge',
        date: twoDaysAgo,
        type: 'public_safety',
        status: 'pending'
      },
      {
        user: users.find(u => u.username === 'jane') || users[2] || users[0],
        area: areas[2] || areas[0],
        title: 'Water leak near entrance',
        description: 'Water is leaking from a pipe near the main entrance. It\'s been flowing for 3 days.',
        address: 'Main Entrance, Oak Ridge',
        date: twoDaysAgo,
        type: 'utilities',
        status: 'in-progress'
      },

      // Peter's issues (Riverside Estate)
      {
        user: users.find(u => u.username === 'peter') || users[3] || users[0],
        area: areas[3] || areas[0],
        title: 'Noise complaint - loud parties',
        description: 'House at 12 Valley View is having loud parties every weekend until 3am.',
        address: '12 Valley View, Riverside Estate',
        date: lastWeek,
        type: 'other',
        status: 'pending'
      },

      // Sarah's issues (Hillcrest Estate)
      {
        user: users.find(u => u.username === 'sarah') || users[4] || users[0],
        area: areas[4] || areas[0],
        title: 'Overgrown trees blocking view',
        description: 'Trees near the entrance have grown too tall and are blocking the security camera view.',
        address: 'Main Entrance, Hillcrest Estate',
        date: lastWeek,
        type: 'environmental',
        status: 'pending'
      },

      // Mike's issues (City of Johannesburg)
      {
        user: users.find(u => u.username === 'mike') || users[5] || users[0],
        area: areas[5] || areas[0],
        title: 'Traffic light not working',
        description: 'Traffic lights at the intersection of Main and Commissioner are stuck on red.',
        address: 'Main & Commissioner, Johannesburg CBD',
        date: yesterday,
        type: 'infrastructure',
        status: 'in-progress'
      },

      // Additional issues
      {
        user: users[0],
        area: areas[6] || areas[0],
        title: 'Missing street light covers',
        description: 'Multiple street lights in the industrial area have missing covers, exposing wires.',
        address: 'Industrial Road, Ekurhuleni',
        date: lastWeek,
        type: 'public_safety',
        status: 'pending'
      },
      {
        user: users[1] || users[0],
        area: areas[7] || areas[0],
        title: 'Bus shelter vandalized',
        description: 'The bus shelter on Church Street has been vandalized. Glass broken.',
        address: 'Church Street, Tshwane',
        date: twoDaysAgo,
        type: 'infrastructure',
        status: 'pending'
      },
      {
        user: users[2] || users[0],
        area: areas[8] || areas[0],
        title: 'Pool pump broken',
        description: 'The swimming pool pump is broken. Water is turning green.',
        address: 'Pool area, Parkview Apartments',
        date: lastWeek,
        type: 'utilities',
        status: 'in-progress'
      },
      {
        user: users[3] || users[0],
        area: areas[9] || areas[0],
        title: 'Elevator not working',
        description: 'The elevator in Block B has been out of service for 3 days. Elderly residents struggling.',
        address: 'Block B, Harbour View',
        date: twoDaysAgo,
        type: 'infrastructure',
        status: 'pending'
      },
      {
        user: users[4] || users[0],
        area: areas[10] || areas[0],
        title: 'Parking allocation dispute',
        description: 'Visitors are parking in residents\' allocated bays. Need better enforcement.',
        address: 'Parking area, City Lofts',
        date: yesterday,
        type: 'other',
        status: 'pending'
      },
      {
        user: users[5] || users[0],
        area: areas[0],
        title: 'Completed issue example',
        description: 'This issue has been resolved and completed.',
        address: '123 Main St, Sunnyvale Estate',
        date: lastMonth,
        type: 'infrastructure',
        status: 'completed'
      }
    ];

    console.log(`\n📋 Preparing to insert ${issues.length} issues...\n`);

    const stmt = db.prepare(
      `INSERT OR IGNORE INTO issues 
       (user_id, area_id, title, description, street_address, issue_date, issue_type, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    let insertedCount = 0;
    let skippedCount = 0;

    for (const issue of issues) {
      await new Promise((resolve) => {
        stmt.run(
          [
            issue.user.id,
            issue.area.id,
            issue.title,
            issue.description,
            issue.address,
            issue.date,
            issue.type,
            issue.status
          ],
          function(err) {
            if (err) {
              console.error(`  ❌ Error: ${issue.title.substring(0, 30)}... - ${err.message}`);
            } else if (this.changes > 0) {
              insertedCount++;
              console.log(`  ✅ Created: ${issue.title.substring(0, 40)}...`);
            } else {
              skippedCount++;
            }
            resolve();
          }
        );
      });
    }

    stmt.finalize();

    console.log('\n📊 ISSUES INSERTION SUMMARY:');
    console.log(`   ✅ New issues created: ${insertedCount}`);
    console.log(`   ⏭️  Already existed: ${skippedCount}`);
    console.log(`   📝 Total attempted: ${issues.length}`);

    // Show summary by status
    const statusCounts = {
      pending: issues.filter(i => i.status === 'pending').length,
      'in-progress': issues.filter(i => i.status === 'in-progress').length,
      completed: issues.filter(i => i.status === 'completed').length
    };

    console.log('\n📊 ISSUES BY STATUS:');
    console.log(`   ⏳ Pending: ${statusCounts.pending}`);
    console.log(`   🔧 In Progress: ${statusCounts['in-progress']}`);
    console.log(`   ✅ Completed: ${statusCounts.completed}`);

    // Show summary by type
    const typeCounts = {};
    issues.forEach(i => {
      typeCounts[i.type] = (typeCounts[i.type] || 0) + 1;
    });

    console.log('\n📊 ISSUES BY TYPE:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   • ${type}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error in mock issues script:', error);
  }
}

insertMockIssues();

setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('\n✅ Database connection closed');
    }
  });
}, 2000);