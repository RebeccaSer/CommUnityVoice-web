// SMS service (development version - logs to console)
const sendSMS = async ({ to, message }) => {
  try {
    console.log('=== SMS WOULD BE SENT ===');
    console.log('To:', to);
    console.log('Message:', message);
    console.log('=========================');
    
    // In development, just return success
    return {
      sid: 'dev-' + Date.now(),
      simulated: true
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
};

// For production with Twilio:
// const twilio = require('twilio');
// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );
// 
// const sendSMS = async ({ to, message }) => {
//   const result = await client.messages.create({
//     body: message,
//     to,
//     from: process.env.TWILIO_PHONE_NUMBER
//   });
//   return result;
// };

module.exports = { sendSMS };