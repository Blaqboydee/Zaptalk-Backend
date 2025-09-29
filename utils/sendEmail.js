const nodemailer = require("nodemailer");

async function sendEmail(to, subject, html) {
  // transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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
