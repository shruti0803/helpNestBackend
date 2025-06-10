import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Helper from './models/helper.model.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use('google-helper', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
 callbackURL: 'http://localhost:5000/authE/googleH/callbackH'

, // must match Google Console redirect URI
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if helper with this email exists
    const existingHelper = await Helper.findOne({ email: profile.emails[0].value });
    if (existingHelper) return done(null, existingHelper);

    // If not, create a new helper
    const newHelper = await Helper.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      password: null,  // Google login, no password needed
    });
    return done(null, newHelper);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((helper, done) => {
  done(null, helper.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const helper = await Helper.findById(id);
    done(null, helper);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
