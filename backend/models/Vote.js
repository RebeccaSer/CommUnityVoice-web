const db = require('../config/database');

class Vote {
  static async create(voteData) {
    return new Promise((resolve, reject) => {
      const {  issue_id, user_id, vote_type } = voteData;
      db.run(
        'INSERT OR REPLACE INTO votes ( issue_id, user_id, vote_type) VALUES (?, ?, ?)',
        [ issue_id, user_id, vote_type],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID,  issue_id, user_id, vote_type });
        }
      );
    });
  }

  static async findByUserAndIssue(user_id,  issue_id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM votes WHERE user_id = ? AND  issue_id = ?',
        [user_id,  issue_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async getVoteCounts( issue_id) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(CASE WHEN vote_type = 'approve' THEN 1 END) as approve_count,
          COUNT(CASE WHEN vote_type = 'reject' THEN 1 END) as reject_count
        FROM votes 
        WHERE  issue_id = ?
      `, [ issue_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

module.exports = Vote;