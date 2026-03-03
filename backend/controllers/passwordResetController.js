const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { sendSMS } = require('../utils/smsService');

// Generate a random 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a random token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email, contact_number } = req.body;
    
    if (!email && !contact_number) {
      return res.status(400).json({ error: 'Please provide email or contact number' });
    }

    // Find user by email or contact
    let user = null;
    if (email) {
      user = await User.findByEmail(email);
    } else if (contact_number) {
      user = await User.findByContact(contact_number);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token and code
    const resetToken = generateToken();
    const resetCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 30 * 60000); // 30 minutes

    // Store in database
    await User.setResetToken(user.id, resetToken, resetCode, expiresAt);

    // Send based on what was provided
    if (email) {
      // Send email with reset link
      const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&code=${resetCode}`;
      await sendEmail({
        to: email,
        subject: 'Password Reset Request - CommUnityVoice',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested to reset your password for CommUnityVoice.</p>
          <p>Click the link below to reset your password (valid for 30 minutes):</p>
          <a href="${resetLink}">Reset Password</a>
          <p>Or use this code: <strong>${resetCode}</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
    }

    if (contact_number) {
      // Send SMS with reset code
      await sendSMS({
        to: contact_number,
        message: `Your CommUnityVoice password reset code is: ${resetCode}. Valid for 30 minutes.`
      });
    }

    res.json({ 
      message: 'Reset instructions sent successfully',
      // In development, return the code for testing
      ...(process.env.NODE_ENV === 'development' && { code: resetCode, token: resetToken })
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify reset code
const verifyResetCode = async (req, res) => {
  try {
    const { token, code } = req.body;

    const reset = await User.verifyResetToken(token, code);
    
    if (!reset) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    res.json({ 
      message: 'Code verified successfully',
      userId: reset.user_id
    });

  } catch (error) {
    console.error('Code verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, code, newPassword } = req.body;

    // Validate password
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify reset token
    const reset = await User.verifyResetToken(token, code);
    
    if (!reset) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.updatePassword(reset.user_id, hashedPassword);

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  requestPasswordReset,
  verifyResetCode,
  resetPassword
};