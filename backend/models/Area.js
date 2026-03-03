const db = require('../config/database');

class Area {
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM areas ORDER BY type, name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findByType(type) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM areas WHERE type = ? ORDER BY name', [type], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM areas WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async create(areaData) {
    return new Promise((resolve, reject) => {
      const { name, type, description } = areaData;
      db.run(
        'INSERT INTO areas (name, type, description) VALUES (?, ?, ?)',
        [name, type, description],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, name, type, description });
        }
      );
    });
  }

  static async getIssuesByArea(areaId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT i.*, u.username as author, a.name as area_name, a.type as area_type,
               COUNT(CASE WHEN v.vote_type = 'approve' THEN 1 END) as approve_count,
               COUNT(CASE WHEN v.vote_type = 'reject' THEN 1 END) as reject_count
        FROM issues i
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN areas a ON i.area_id = a.id
        LEFT JOIN votes v ON i.id = v.issue_id
        WHERE i.area_id = ?
        GROUP BY i.id
        ORDER BY i.created_at DESC
      `, [areaId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = Area;