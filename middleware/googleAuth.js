import passport from 'passport';

// Middleware to start Google OAuth login flow
export const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// Middleware to handle Google OAuth callback
export const googleCallback = passport.authenticate('google', {
  failureRedirect: '/login',
  session: true,  // use sessions
});




import  '../passport.helper.js'
// ✅ Middleware to start Google OAuth login flow for helpers
export const googleHelperLogin = passport.authenticate('google-helper', {
  scope: ['profile', 'email'],
  prompt: 'select_account', // optional but recommended to allow account switching
});

// ✅ Middleware to handle Google OAuth callback for helpers
export const googleHelperCallback = passport.authenticate('google-helper', {
  failureRedirect: '/login',
  session: true, // ensure session is enabled
});
