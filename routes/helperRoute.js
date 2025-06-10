import express from 'express';
import { getHelperProfile, getTestScore, getTrainingProgress, loginHelper, Logout, registerHelper, selectServices, updateHelperDetails, updateTestScore, updateTrainingProgress } from '../controllers/helperController.js';
import isHelperAuthenticated from '../middleware/isHelperMiddleware.js';
import upload from '../middleware/upload.js';


const router = express.Router();

router.post('/register', registerHelper);
router.post('/login', loginHelper);
router.put('/details', isHelperAuthenticated,upload.single("govtDocument")
, updateHelperDetails);
router.get("/profile", isHelperAuthenticated, getHelperProfile);
router.get("/logout", isHelperAuthenticated, Logout);


router.get('/training/progress', isHelperAuthenticated, getTrainingProgress);
router.post('/training/progress',isHelperAuthenticated, updateTrainingProgress);

router.get('/test-score', isHelperAuthenticated, getTestScore);
router.post('/test-score', isHelperAuthenticated, updateTestScore);


router.patch("/select-services", isHelperAuthenticated, selectServices);



// import passport from '../passport.helper.js';



// // ✅ Step 1: Start Google OAuth login
// router.get(
//   '/google',
//   passport.authenticate('google-helper', {
//     scope: ['profile', 'email'],
//     prompt: 'select_account',
//   })
// );

// // ✅ Step 2: Handle Google OAuth callback
// router.get(
//   '/google/callback',
//   passport.authenticate('google-helper', {
//     failureRedirect: '/login',
//     session: true,
//   }),
//   (req, res, next) => {
//     // ✅ Proper login to establish session
//     req.login(req.user, (err) => {
//       if (err) return next(err);

//       // ✅ Now session is saved — no need to manually set cookie
//       res.redirect('http://localhost:5173/helper-login-success');
//     });
//   }
// );






export default router;
