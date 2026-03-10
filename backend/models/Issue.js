// const { default: Issues } = require('../../backend/routes/Issue');
const db = require('../config/database');

class Issue {
  static async create(issueData) {
  return new Promise((resolve, reject) => {
    const { title, description, image_url, user_id, area_id, street_address, issue_date, issue_type } = issueData;
    db.run(
      'INSERT INTO issues (title, description, image_url, user_id, area_id, street_address, issue_date, issue_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, image_url, user_id, area_id, street_address, issue_date, issue_type],
      function(err) {
        if (err) reject(err);
        else resolve({id: this.lastID, 
          title, description, image_url, user_id, area_id,
          street_address, issue_date, issue_type,
          status: 'pending',
          created_at: new Date().toISOString() });
      }
    );
  });
}

  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT issues.*, users.username as author, 
               COUNT(CASE WHEN votes.vote_type = 'approve' THEN 1 END) as approve_count,
               COUNT(CASE WHEN votes.vote_type = 'reject' THEN 1 END) as reject_count
        FROM issues 
        LEFT JOIN users ON issues.user_id = users.id
        LEFT JOIN votes ON issues.id = votes.issue_id
        GROUP BY issues.id
        ORDER BY approve_count DESC, created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT issues.*, users.username as author,
               COUNT(CASE WHEN votes.vote_type = 'approve' THEN 1 END) as approve_count,
               COUNT(CASE WHEN votes.vote_type = 'reject' THEN 1 END) as reject_count
        FROM issues 
        LEFT JOIN users ON issues.user_id = users.id
        LEFT JOIN votes ON issues.id = votes.issue_id
        WHERE issues.id = ?
        GROUP BY issues.id
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findByType(type) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT i.*, 
               u.username as author,
               COUNT(CASE WHEN v.vote_type = 'approve' THEN 1 END) as approve_count,
               COUNT(CASE WHEN v.vote_type = 'reject' THEN 1 END) as reject_count
        FROM issues i
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN votes v ON i.id = v.issue_id
        WHERE i.issue_type = ?
        GROUP BY i.id
        ORDER BY i.created_at DESC
      `, [type], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findByLocation(location) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT i.*, 
               u.username as author,
               COUNT(CASE WHEN v.vote_type = 'approve' THEN 1 END) as approve_count,
               COUNT(CASE WHEN v.vote_type = 'reject' THEN 1 END) as reject_count
        FROM issues i
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN votes v ON i.id = v.issue_id
        WHERE i.street_address LIKE ?
        GROUP BY i.id
        ORDER BY i.created_at DESC
      `, [`%${location}%`], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
 static async findByArea(areaId) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT issues.*, users.username as author, areas.name as area_name, areas.type as area_type,
             COUNT(CASE WHEN votes.vote_type = 'approve' THEN 1 END) as approve_count,
             COUNT(CASE WHEN votes.vote_type = 'reject' THEN 1 END) as reject_count
      FROM issues 
      LEFT JOIN users ON issues.user_id = users.id
      LEFT JOIN areas ON issues.area_id = areas.id
      LEFT JOIN votes ON issues.id = votes.issue_id
      WHERE issues.area_id = ?
      GROUP BY issues.id
      ORDER BY approve_count DESC, created_at DESC
    `, [areaId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

  static async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      const completed_at = status === 'completed' ? new Date().toISOString() : null;
      
      db.run(
        'UPDATE issues SET status = ?, completed_at = ? WHERE id = ?',
        [status, completed_at, id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM  issues WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
}

module.exports =  Issue;