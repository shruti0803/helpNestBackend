// routes/auth.js
import express from 'express';
import { sendOTPEmail } from '../controllers/emailService.js';

const router = express.Router();

router.post('/login/request-otp', async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 👉 Save OTP to DB with expiry (optional for now)
  console.log(`Generated OTP for ${email}: ${otp}`);

  try {
    await sendOTPEmail(email, otp);
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

export default router;
