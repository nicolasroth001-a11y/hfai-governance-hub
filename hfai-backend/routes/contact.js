const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, company, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"HFAI Contact Form" <${process.env.CONTACT_EMAIL}>`,
      to: 'nicolasroth001@gmail.com',
      replyTo: email,
      subject: `New inquiry from ${name} (${company || 'N/A'})`,
      text: `Name: ${name}\nCompany: ${company || 'N/A'}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

module.exports = router;
