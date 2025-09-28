const nodemailer = require("nodemailer");

async function sendEmail(to, subject, html) {
  // transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g. "smtp.gmail.com"
    port: process.env.EMAIL_PORT, // 587 for TLS
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS, // your app password
    },
  });

  // mail options
  const mailOptions = {
    from: `"Zaptalk" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  // send mail
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
