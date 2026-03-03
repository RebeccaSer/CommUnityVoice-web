const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ADMIN_REGISTRATION_TOKEN = process.env.ADMIN_REGISTRATION_TOKEN || 'super-secret-admin-token-2024';

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
    if (adminToken && adminToken === ADMIN_REGISTRATION_TOKEN) {
      role = 'admin';
      console.log('Admin registration detected for user:', username);
    }

    const newUser = await User.create({
      username,
      password: hashedPassword,
      email: email || null,
      contact_number: contact_number || null,
      area_id: area_id || null,
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