const db = require('../config/database');

class User {
  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findByContact(contact_number) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE contact_number = ?', [contact_number], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findById(id) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT u.id, u.username, u.email, u.contact_number, u.role, 
             u.email_verified, u.contact_verified, u.area_id,
             a.name as area_name, a.type as area_type,
             u.created_at 
      FROM users u
      LEFT JOIN areas a ON u.area_id = a.id
      WHERE u.id = ?
    `, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

  static async create(userData) {
    const { username, password, email, contact_number, area_id, role } = userData;
    console.log('User.create() received:', { username, email, contact_number, area_id, role });

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, password, email, contact_number, area_id, role) VALUES (?, ?, ?, ?, ?, ?)',
        [username, password, email || null, contact_number || null, area_id || null, role || 'user'],
        function(err) {
          if (err) {
            console.error('Database INSERT error:', err);
            reject(err);
          } else {
            console.log('User created successfully with ID:', this.lastID);
            
            // Fetch the created user with area info
            db.get(`
              SELECT u.id, u.username, u.email, u.contact_number, u.role, u.area_id,
                     a.name as area_name, a.type as area_type
              FROM users u
              LEFT JOIN areas a ON u.area_id = a.id
              WHERE u.id = ?
            `, [this.lastID], (err, user) => {
              if (err) reject(err);
              else resolve(user);
            });
          }
        }
      );
    });
  }

  static async updateVerificationCode(userId, code, expiresAt) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET verification_code = ?, verification_expires = ? WHERE id = ?',
        [code, expiresAt, userId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static async verifyEmail(userId, code) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE id = ? AND verification_code = ? AND verification_expires > datetime("now")',
        [userId, code],
        (err, user) => {
          if (err) reject(err);
          else if (!user) resolve(false);
          else {
            db.run(
              'UPDATE users SET email_verified = 1, verification_code = NULL, verification_expires = NULL WHERE id = ?',
              [userId],
              (err) => {
                if (err) reject(err);
                else resolve(true);
              }
            );
          }
        }
      );
    });
  }

  static async setResetToken(userId, token, code, expiresAt) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO password_resets (user_id, token, code, expires_at) VALUES (?, ?, ?, ?)',
        [userId, token, code, expiresAt],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  static async verifyResetToken(token, code) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT pr.*, u.email, u.contact_number, u.area_id
         FROM password_resets pr
         JOIN users u ON pr.user_id = u.id
         WHERE pr.token = ? AND pr.code = ? AND pr.expires_at > datetime("now") AND pr.used = 0`,
        [token, code],
        (err, reset) => {
          if (err) reject(err);
          else resolve(reset);
        }
      );
    });
  }

  static async updatePassword(userId, newPassword) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [newPassword, userId],
        function(err) {
          if (err) reject(err);
          else {
            db.run(
              'UPDATE password_resets SET used = 1 WHERE user_id = ?',
              [userId],
              (err) => {
                if (err) reject(err);
                else resolve({ changes: this.changes });
              }
            );
          }
        }
      );
    });
  }

  static async findByResetToken(token) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT u.* FROM users u
         JOIN password_resets pr ON u.id = pr.user_id
         WHERE pr.token = ? AND pr.expires_at > datetime("now") AND pr.used = 0`,
        [token],
        (err, user) => {
          if (err) reject(err);
          else resolve(user);
        }
      );
    });
  }

  static async updateArea(userId, areaId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET area_id = ? WHERE id = ?',
        [areaId, userId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }
}

module.exports = User;