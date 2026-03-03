import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [method, setMethod] = useState('email'); // 'email' or 'sms'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: request, 2: verify, 3: reset
  const [resetToken, setResetToken] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [userId, setUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = method === 'email' 
        ? { email } 
        : { contact_number: contactNumber };

      const response = await api.passwordReset.request(data);
      
      setSuccess(`Reset instructions sent to your ${method}. Check your ${method === 'email' ? 'inbox' : 'messages'}.`);
      setStep(2);
      
      // In development, show the code
      if (response.code) {
        setResetCode(response.code);
        setResetToken(response.token);
      }
    } catch (error) {
      setError(error.message || 'Failed to send reset instructions');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.passwordReset.verify({
        token: resetToken,
        code: resetCode
      });
      
      setUserId(response.userId);
      setStep(3);
    } catch (error) {
      setError(error.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await api.passwordReset.reset({
        token: resetToken,
        code: resetCode,
        newPassword
      });
      
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">
          {step === 1 && 'Reset Password'}
          {step === 2 && 'Verify Code'}
          {step === 3 && 'Set New Password'}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Step 1: Request Reset */}
        {step === 1 && (
          <form onSubmit={handleRequestReset}>
            <div className="mb-4">
              <label className="block text-white mb-2">Reset Method</label>
              <div className="flex gap-4">
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    value="email"
                    checked={method === 'email'}
                    onChange={(e) => setMethod(e.target.value)}
                    className="mr-2"
                  />
                  Email
                </label>
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    value="sms"
                    checked={method === 'sms'}
                    onChange={(e) => setMethod(e.target.value)}
                    className="mr-2"
                  />
                  SMS
                </label>
              </div>
            </div>

            {method === 'email' ? (
              <div className="mb-6">
                <label className="block text-white mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded bg-white bg-opacity-90 focus:bg-white border border-gray-300 focus:border-blue-500 outline-none transition"
                  required
                  disabled={loading}
                />
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-white mb-2" htmlFor="contact">
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contact"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full p-3 rounded bg-white bg-opacity-90 focus:bg-white border border-gray-300 focus:border-blue-500 outline-none transition"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>

            <p className="text-white text-center mt-4">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-300 hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div className="mb-6">
              <label className="block text-white mb-2" htmlFor="code">
                Enter Verification Code
              </label>
              <input
                type="text"
                id="code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="6-digit code"
                className="w-full p-3 rounded bg-white bg-opacity-90 focus:bg-white border border-gray-300 focus:border-blue-500 outline-none transition"
                required
                disabled={loading}
                maxLength={6}
              />
              <p className="text-white text-sm mt-2">
                Check your {method} for a 6-digit verification code
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-2 text-white hover:underline"
            >
              ← Back
            </button>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-white mb-2" htmlFor="newPassword">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 rounded bg-white bg-opacity-90 focus:bg-white border border-gray-300 focus:border-blue-500 outline-none transition"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="mb-6">
              <label className="block text-white mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded bg-white bg-opacity-90 focus:bg-white border border-gray-300 focus:border-blue-500 outline-none transition"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;