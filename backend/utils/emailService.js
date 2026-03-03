const nodemailer = require('nodemailer');

// Create a transporter (configure for development - logs to console)
const transporter = {
  sendMail: async (mailOptions) => {
    console.log('=== EMAIL WOULD BE SENT ===');
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('Body:', mailOptions.html);
    console.log('===========================');
    
    // In development, just return success
    return {
      messageId: 'dev-' + Date.now(),
      accepted: [mailOptions.to]
    };
  }
};

// For production, you would use real SMTP:
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//   port: process.env.EMAIL_PORT || 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"CommUnityVoice" <${process.env.EMAIL_USER || 'noreply@communityvoice.com'}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = { sendEmail };