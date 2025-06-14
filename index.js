import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from  './Passport.js';

import connectDB from './config/db.js';
import userRoutes from './routes/userRoute.js';
import helperRoutes from './routes/helperRoute.js';
import bookingRoutes from './routes/bookingRoute.js';
import authERoutes from './routes/authE.js';  // 👈 your Google login route
import healthRoutes from './routes/healthRoute.js'
import billRoutes from './routes/billRoute.js'
dotenv.config({ path: ".env" });

const app = express();

app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// ✅ One session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  }
}));

// ✅ Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ Register routes
app.use('/api/users', userRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/authE', authERoutes); // 👈 Now the Google OAuth routes work
app.use('/api/health',healthRoutes);
app.use('/api/bills', billRoutes);
// ✅ Connect to database and start server
connectDB();
const PORT = process.env.PORT || 5000;
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
