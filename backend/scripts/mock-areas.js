const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('='.repeat(50));
console.log('🏘️  MOCK AREAS SCRIPT');
console.log('='.repeat(50));

const areas = [
  // Estates
  ['Sunnyvale Estate', 'estate', 'Luxury residential estate with 500 homes'],
  ['Green Meadows', 'estate', 'Family-friendly estate with park'],
  ['Oak Ridge', 'estate', 'Secure estate with 24/7 security'],
  ['Riverside Estate', 'estate', 'Beautiful estate along the river'],
  ['Hillcrest Estate', 'estate', 'Exclusive estate with mountain views'],
  
  // Municipalities
  ['City of Johannesburg', 'municipality', 'Metropolitan municipality - City of Gold'],
  ['Ekurhuleni', 'municipality', 'East Rand metropolitan area'],
  ['City of Tshwane', 'municipality', 'Pretoria metropolitan area'],
  ['City of Cape Town', 'municipality', 'Mother City metropolitan area'],
  ['eThekwini', 'municipality', 'Durban metropolitan area'],
  
  // Complexes
  ['Parkview Apartments', 'complex', 'Modern apartment complex with pool'],
  ['Harbour View', 'complex', 'Beachfront apartment complex'],
  ['Mountain Ridge', 'complex', 'Townhouse complex with mountain views'],
  ['The Gardens', 'complex', 'Secure garden complex for families'],
  ['City Lofts', 'complex', 'Urban loft apartments in city center']
];

console.log(`\n📋 Preparing to insert ${areas.length} areas...\n`);

db.serialize(() => {
  // First check if areas table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='areas'", (err, table) => {
    if (err) {
      console.error('❌ Error checking table:', err.message);
      db.close();
      return;
    }
    
    if (!table) {
      console.error('❌ Areas table does not exist!');
      console.error('   Please make sure your server has created the tables first.');
      console.error('   Run: npm start');
      db.close();
      return;
    }

    // Check existing count
    db.get("SELECT COUNT(*) as count FROM areas", (err, row) => {
      if (err) {
        console.error('❌ Error counting areas:', err.message);
      } else {
        console.log(`📊 Existing areas in database: ${row.count}`);
      }
    });

    // Insert areas
    const stmt = db.prepare('INSERT OR IGNORE INTO areas (name, type, description) VALUES (?, ?, ?)');
    let insertedCount = 0;
    let skippedCount = 0;

    areas.forEach(area => {
      stmt.run(area, function(err) {
        if (err) {
          console.error(`  ❌ Error inserting ${area[0]}:`, err.message);
        } else if (this.changes > 0) {
          insertedCount++;
          console.log(`  ✅ Inserted: ${area[0]}`);
        } else {
          skippedCount++;
        }
      });
    });

    stmt.finalize();

    // Show summary after all inserts
    setTimeout(() => {
      console.log('\n📊 AREAS INSERTION SUMMARY:');
      console.log(`   ✅ New areas inserted: ${insertedCount}`);
      console.log(`   ⏭️  Already existed: ${skippedCount}`);
      console.log(`   📝 Total attempted: ${areas.length}`);
      
      // Show areas by type
      db.all("SELECT type, COUNT(*) as count FROM areas GROUP BY type", (err, rows) => {
        if (!err && rows) {
          console.log('\n📊 AREAS BY TYPE:');
          rows.forEach(row => {
            console.log(`   • ${row.type}: ${row.count}`);
          });
        }
        
        console.log('\n✅ Areas script completed');
        db.close();
      });
    }, 500);
  });
});