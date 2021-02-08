const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HORT,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendEmail = async (from, to, subject, html) => {
  await transporter.sendMail({
    from,
    to,
    subject,
    text: "Please load the HTML version of this email.",
    html
  });
};

module.exports = { sendEmail };
