const express = require('express');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const limiter = rateLimit({windowMs:60*1000,max:6});
app.use('/api/', limiter);

app.post('/api/contact', async (req,res) => {
  try{
    const {honeypot,name,phone,email,course,message} = req.body;
    if(honeypot) return res.status(400).json({message:'spam detected'});
    const toEmail = process.env.TO_EMAIL || 'gravitoninstitute@gmail.com';

    // If SMTP config present, send email. Otherwise log to console.
    if(process.env.SMTP_HOST && process.env.SMTP_USER){
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}
      });
      await transporter.sendMail({from:email||process.env.SMTP_USER,to:toEmail,subject:`Contact: ${name} (${course})`,text:`${message}\nPhone: ${phone}`});
      return res.json({message:'Message sent'});
    }

    console.log('CONTACT FORM', {name,phone,email,course,message});
    return res.json({message:'Received (no SMTP configured). Check server logs.'});
  }catch(err){
    console.error(err);res.status(500).json({message:'Server error'});
  }
});

// Serve index.html for root and all non-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({message: 'Not found'});
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, ()=>console.log(`Server running on ${PORT}`));
}

// Export for Vercel
module.exports = app;
