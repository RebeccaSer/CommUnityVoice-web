const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../config/database');

// Area-specific admin tokens from .env
const AREA_ADMIN_TOKENS = {
  'Sunnyvale Estate': process.env.ADMIN_TOKEN_SUNNYVALE,
  'Green Meadows': process.env.ADMIN_TOKEN_GREEN_MEADOWS,
  'Oak Ridge': process.env.ADMIN_TOKEN_OAK_RIDGE,
  'Riverside Estate': process.env.ADMIN_TOKEN_RIVERSIDE,
  'Hillcrest Estate': process.env.ADMIN_TOKEN_HILLCREST,
  'City of Johannesburg': process.env.ADMIN_TOKEN_JOHANNESBURG,
  'Ekurhuleni': process.env.ADMIN_TOKEN_EKURHULENI,
  'City of Tshwane': process.env.ADMIN_TOKEN_TSHWANE,
  'City of Cape Town': process.env.ADMIN_TOKEN_CAPE_TOWN,
  'eThekwini': process.env.ADMIN_TOKEN_ETHEKWINI,
  'Parkview Apartments': process.env.ADMIN_TOKEN_PARKVIEW,
  'Harbour View': process.env.ADMIN_TOKEN_HARBOUR_VIEW,
  'Mountain Ridge': process.env.ADMIN_TOKEN_MOUNTAIN_RIDGE,
  'The Gardens': process.env.ADMIN_TOKEN_GARDENS,
  'City Lofts': process.env.ADMIN_TOKEN_CITY_LOFTS
};

const SUPER_ADMIN_TOKEN = process.env.SUPER_ADMIN_TOKEN;

// Helper function to get area from token
const getAreaFromToken = async (token) => {
  // Check super admin first
  if (token === SUPER_ADMIN_TOKEN) {
    return { role: 'admin', area_id: null }; // superadmin is admin with no area
  }

  // Check area-specific tokens
  for (const [areaName, areaToken] of Object.entries(AREA_ADMIN_TOKENS)) {
    if (token === areaToken) {
      // Get area ID from database
      const area = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM areas WHERE name = ?', [areaName], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (area) {
        return { role: 'admin', area_id: area.id };
      }
    }
  }
  
  return null; // invalid token
};

const register = async (req, res) => {
  try {
    console.log('=== REGISTRATION DEBUG ===');
    console.log('Request body:', req.body);
    
    const { username, password, email, contact_number, area_id, adminToken } = req.body;

    // Check if username exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email exists (if provided)
    if (email) {
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Check if contact number exists (if provided)
    if (contact_number) {
      const existingContact = await User.findByContact(contact_number);
      if (existingContact) {
        return res.status(400).json({ error: 'Contact number already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let role = 'user';
    let assignedAreaId = area_id; // from form, may be overwritten by token

    // Check for admin token
    if (adminToken) {
  const tokenInfo = await getAreaFromToken(adminToken);
  
  if (tokenInfo) {
    role = tokenInfo.role;
    assignedAreaId = tokenInfo.area_id;
    console.log(`Admin registration: role=${role}, area_id=${assignedAreaId}`);
  } else {
    // Invalid token – return error instead of creating a regular user
    console.log('Invalid admin token provided – registration rejected');
    return res.status(400).json({ error: 'Invalid admin token provided' });
  }
}

    // If token didn't set area, and user provided area_id, validate it
    if (assignedAreaId) {
      const area = await new Promise((resolve) => {
        db.get('SELECT id FROM areas WHERE id = ?', [assignedAreaId], (err, row) => {
          if (err) resolve(null);
          else resolve(row);
        });
      });
      if (!area) {
        return res.status(400).json({ error: 'Selected area does not exist' });
      }
    }

    const newUser = await User.create({
      username,
      password: hashedPassword,
      email: email || null,
      contact_number: contact_number || null,
      area_id: assignedAreaId || null,
      role
    });

    const token = jwt.sign(
      { 
        userId: newUser.id, 
        username: newUser.username,
        role: newUser.role,
        area_id: newUser.area_id
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7days' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        contact_number: newUser.contact_number,
        area_id: newUser.area_id,
        area_name: newUser.area_name,
        area_type: newUser.area_type,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Fetch full user with area info
    const userWithArea = await User.findById(user.id);

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role,
        area_id: user.area_id
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: userWithArea
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { register, login, getProfile };