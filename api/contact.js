import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { honeypot, name, phone, email, course, message } = req.body;
    
    // Spam check
    if (honeypot) {
      return res.status(400).json({ message: 'spam detected' });
    }

    const toEmail = process.env.TO_EMAIL || 'gravitoninstitute@gmail.com';

    // If SMTP config is present, send email
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: toEmail,
          subject: `Contact: ${name} (${course})`,
          text: `Message: ${message}\n\nPhone: ${phone}\nEmail: ${email}`
        });

        return res.status(200).json({ message: 'Message sent successfully' });
      } catch (emailError) {
        console.error('Email error:', emailError);
        return res.status(200).json({ message: 'Enquiry received (email delivery failed, but we have your message)' });
      }
    }

    // If no SMTP configured, just log it
    console.log('CONTACT FORM SUBMISSION:', { name, phone, email, course, message });
    return res.status(200).json({ message: 'Enquiry received. We will contact you soon!' });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
}

