import express from 'express';
import { googleCallback, googleLogin } from '../middleware/googleAuth.js';

const router = express.Router();

router.get('/google', googleLogin);

router.get('/google/callback', googleCallback, (req, res) => {
  // On success, redirect to frontend
  console.log('✅ Google Login User:', req.user);
  console.log('✅ Session:', req.session);
  res.redirect('http://localhost:5173/login-success');
});


//helper 
import { googleHelperCallback, googleHelperLogin } from '../middleware/googleAuth.js';

router.get('/googleH', googleHelperLogin);

import jwt from 'jsonwebtoken';

router.get('/googleH/callbackH', googleHelperCallback, (req, res) => {
  req.login(req.user, (err) => {
    if (err) return res.redirect('/login');

    // ✅ Create JWT token manually
    const token = jwt.sign(
      {
        userId: req.user._id,
        role: 'helper',
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: '1d',
      }
    );

    // ✅ Set cookie with JWT
    res.cookie('helper_token', token, {
      httpOnly: true,
      secure: false, // ✅ set to true in production with HTTPS
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // ✅ Redirect to frontend success page
    res.redirect('http://localhost:5173/helper-login-success');
  });
});



export default router;
