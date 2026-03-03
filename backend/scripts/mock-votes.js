const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('='.repeat(50));
console.log('👍 MOCK VOTES SCRIPT');
console.log('='.repeat(50));

async function insertMockVotes() {
  try {
    // Check if votes table exists
    const tableCheck = await new Promise((resolve) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='votes'", (err, row) => {
        resolve(!!row);
      });
    });

    if (!tableCheck) {
      console.error('❌ Votes table does not exist!');
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

    if (users.length < 2) {
      console.error('❌ Need at least 2 users to create votes!');
      console.error('   Please run mock-users.js first: npm run db:users');
      db.close();
      return;
    }

    // Get issues
    const issues = await new Promise((resolve, reject) => {
      db.all("SELECT id, user_id, title FROM issues", (err, rows) => {
        if (err) {
          console.error('❌ Error fetching issues:', err.message);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });

    if (issues.length < 3) {
      console.error(`❌ Not enough issues found. Found ${issues.length}, need at least 3.`);
      console.error('   Please run mock-issues.js first: npm run db:issues');
      db.close();
      return;
    }

    console.log(`\n📋 Found ${users.length} users and ${issues.length} issues`);

    // Check existing votes
    const existingVotes = await new Promise((resolve) => {
      db.get("SELECT COUNT(*) as count FROM votes", (err, row) => {
        resolve(row?.count || 0);
      });
    });
    console.log(`📊 Existing votes in database: ${existingVotes}`);

    // Create voting patterns
    console.log('\n📋 Preparing votes...\n');

    const votes = [];
    const voteTypes = ['approve', 'reject'];

    // For each issue, generate votes from users (except the issue creator)
    for (const issue of issues) {
      const eligibleVoters = users.filter(u => u.id !== issue.user_id);
      
      if (eligibleVoters.length === 0) continue;

      // Determine number of votes based on issue popularity
      // First few issues get more votes
      const issueIndex = issues.indexOf(issue);
      let numVotes;
      
      if (issueIndex < 3) {
        // First 3 issues are popular - 60-80% of users vote
        numVotes = Math.floor(eligibleVoters.length * (0.6 + Math.random() * 0.2));
      } else if (issueIndex < 7) {
        // Next 4 issues are moderately popular - 30-50% of users vote
        numVotes = Math.floor(eligibleVoters.length * (0.3 + Math.random() * 0.2));
      } else {
        // Rest have few votes - 10-25% of users vote
        numVotes = Math.floor(eligibleVoters.length * (0.1 + Math.random() * 0.15));
      }

      // Ensure at least 1 vote for first few issues
      if (issueIndex < 5 && numVotes === 0) numVotes = 1;

      // Randomly select voters
      const shuffled = [...eligibleVoters].sort(() => 0.5 - Math.random());
      const selectedVoters = shuffled.slice(0, Math.min(numVotes, eligibleVoters.length));

      // Determine approval ratio (some issues are popular, some controversial)
      let approveRatio;
      if (issueIndex % 4 === 0) {
        approveRatio = 0.8; // Mostly approved (80%)
      } else if (issueIndex % 4 === 1) {
        approveRatio = 0.5; // Split vote (50/50)
      } else if (issueIndex % 4 === 2) {
        approveRatio = 0.3; // Mostly rejected (30%)
      } else {
        approveRatio = 0.9; // Overwhelmingly approved (90%)
      }

      selectedVoters.forEach((voter, index) => {
        const voteType = index / selectedVoters.length < approveRatio ? 'approve' : 'reject';
        votes.push({
          user_id: voter.id,
          issue_id: issue.id,
          vote_type: voteType
        });
      });
    }

    console.log(`📋 Generated ${votes.length} votes to insert\n`);

    const stmt = db.prepare(
      `INSERT OR IGNORE INTO votes (user_id, issue_id, vote_type) VALUES (?, ?, ?)`
    );

    let insertedCount = 0;
    let skippedCount = 0;
    let approveCount = 0;
    let rejectCount = 0;

    for (const vote of votes) {
      await new Promise((resolve) => {
        stmt.run([vote.user_id, vote.issue_id, vote.vote_type], function(err) {
          if (err) {
            console.error(`  ❌ Error: ${err.message}`);
          } else if (this.changes > 0) {
            insertedCount++;
            if (vote.vote_type === 'approve') approveCount++;
            else rejectCount++;
          } else {
            skippedCount++;
          }
          resolve();
        });
      });
    }

    stmt.finalize();

    console.log('\n📊 VOTES INSERTION SUMMARY:');
    console.log(`   ✅ New votes created: ${insertedCount}`);
    console.log(`   ⏭️  Already existed: ${skippedCount}`);
    console.log(`   📝 Total generated: ${votes.length}`);
    console.log(`   👍 Approve: ${approveCount}`);
    console.log(`   👎 Reject: ${rejectCount}`);

    // Show vote distribution by issue
    console.log('\n📊 TOP ISSUES BY VOTES:');
    
    const issueVotes = await new Promise((resolve) => {
      db.all(`
        SELECT 
          i.id,
          substr(i.title, 1, 30) as title,
          COUNT(CASE WHEN v.vote_type = 'approve' THEN 1 END) as approves,
          COUNT(CASE WHEN v.vote_type = 'reject' THEN 1 END) as rejects
        FROM issues i
        LEFT JOIN votes v ON i.id = v.issue_id
        GROUP BY i.id
        HAVING (approves + rejects) > 0
        ORDER BY (approves + rejects) DESC
        LIMIT 5
      `, (err, rows) => {
        resolve(rows || []);
      });
    });

    if (issueVotes.length > 0) {
      issueVotes.forEach(issue => {
        const total = issue.approves + issue.rejects;
        console.log(`   • Issue ${issue.id}: ${total} total votes (${issue.approves} 👍, ${issue.rejects} 👎)`);
        console.log(`     "${issue.title}..."`);
      });
    } else {
      console.log('   No votes created yet');
    }

  } catch (error) {
    console.error('❌ Error in mock votes script:', error);
  }
}

insertMockVotes();

setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('\n✅ Database connection closed');
    }
  });
}, 2000);