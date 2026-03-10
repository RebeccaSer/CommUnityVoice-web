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

static async isAreaAdmin(userId, areaId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE id = ? AND role = "admin" AND area_id = ?',
      [userId, areaId],
      (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      }
    );
  });
}

static async getAreaByToken(token) {
  return new Promise((resolve, reject) => {
    // Map token to area ID based on env vars
    const areaMapping = {
      [process.env.ADMIN_TOKEN_SUNNYVALE]: 'Sunnyvale Estate',
      [process.env.ADMIN_TOKEN_GREEN_MEADOWS]: 'Green Meadows',
      [process.env.ADMIN_TOKEN_OAK_RIDGE]: 'Oak Ridge',
      [process.env.ADMIN_TOKEN_RIVERSIDE]: 'Riverside Estate',
      [process.env.ADMIN_TOKEN_HILLCREST]: 'Hillcrest Estate',
      [process.env.ADMIN_TOKEN_JOHANNESBURG]: 'City of Johannesburg',
      [process.env.ADMIN_TOKEN_EKURHULENI]: 'Ekurhuleni',
      [process.env.ADMIN_TOKEN_TSHWANE]: 'City of Tshwane',
      [process.env.ADMIN_TOKEN_CAPE_TOWN]: 'City of Cape Town',
      [process.env.ADMIN_TOKEN_ETHEKWINI]: 'eThekwini',
      [process.env.ADMIN_TOKEN_PARKVIEW]: 'Parkview Apartments',
      [process.env.ADMIN_TOKEN_HARBOUR_VIEW]: 'Harbour View',
      [process.env.ADMIN_TOKEN_MOUNTAIN_RIDGE]: 'Mountain Ridge',
      [process.env.ADMIN_TOKEN_GARDENS]: 'The Gardens',
      [process.env.ADMIN_TOKEN_CITY_LOFTS]: 'City Lofts'
    };

    const areaName = areaMapping[token];
    
    if (!areaName) {
      resolve(null);
      return;
    }

    db.get('SELECT id FROM areas WHERE name = ?', [areaName], (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}
}
module.exports = User;