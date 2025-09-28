const nodemailer = require("nodemailer");

async function sendEmail(to, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify(); // will throw if connection/auth fails

    const mailOptions = {
      from: `"Zaptalk" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Nodemailer error:", err);
    throw err; 
  }
}

module.exports = sendEmail;
