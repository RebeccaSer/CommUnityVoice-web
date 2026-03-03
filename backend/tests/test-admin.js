const bcrypt = require('bcrypt');
const db = require('./config/database');

// Test creating an admin user with token
const testAdminCreation = () => {
  const adminToken = 'super-secret-admin-token-2024'; 
  const testUser = {
    username: 'testadmin',
    email: 'testadmin@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'admin'
  };

  db.run(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [testUser.username, testUser.email, testUser.password, testUser.role],
    function(err) {
      if (err) {
        console.log('Admin user creation test:', err.message);
      } else {
        console.log('Admin user created successfully with ID:', this.lastID);
        
        // Verify the user was created with admin role
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            console.log('Error fetching test user:', err);
          } else {
            console.log('Test user details:', {
              id: row.id,
              username: row.username,
              role: row.role
            });
          }
        });
      }
    }
  );
};

// Check current users and their roles
db.all('SELECT id, username, role FROM users', (err, rows) => {
  if (err) {
    console.log('Error fetching users:', err);
  } else {
    console.log('\n=== Current Users in Database ===');
    rows.forEach(user => {
      console.log(`ID: ${user.id}, Username: ${user.username}, Role: ${user.role}`);
    });
    console.log('================================\n');
    
    // Run the admin creation test
    testAdminCreation();
  }
});