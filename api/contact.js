const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const parseBody = bodyParser.json();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await new Promise((resolve, reject) => {
    parseBody(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  try {
    const { honeypot, name, phone, email, course, message } = req.body;
    
    if (honeypot) {
      return res.status(400).json({ message: 'spam detected' });
    }

    const toEmail = process.env.TO_EMAIL || 'gravitoninstitute@gmail.com';

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: email || process.env.SMTP_USER,
        to: toEmail,
        subject: `Contact: ${name} (${course})`,
        text: `${message}\nPhone: ${phone}`
      });

      return res.json({ message: 'Message sent' });
    }

    console.log('CONTACT FORM', { name, phone, email, course, message });
    return res.json({ message: 'Received (no SMTP configured). Check server logs.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
