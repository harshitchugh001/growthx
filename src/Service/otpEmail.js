const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_ENV);

const sendEmail = async (toEmail, otpCode) => {
  const msg = {
    to: toEmail,
    from: process.env.SENDER_ID,
    subject: 'Your OTP Code for Verification',
    text: `Your OTP code is: ${otpCode}. It is valid for the next 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>OTP Verification</h2>
        <p>Hi,</p>
        <p>Your OTP code is: <strong>${otpCode}</strong></p>
        <p>Please enter this code to verify your identity. This code is valid for the next 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p>Thank you,</p>
        <p> :}</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendEmail,
};