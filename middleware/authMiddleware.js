import jwt from 'jsonwebtoken';

const isAuthenticated = (req, res, next) => {
  try {
    // ✅ First check if user is authenticated via session (Google login)
    if (req.isAuthenticated && req.isAuthenticated()) {
      console.log("✅ Authenticated via session (Google login):", req.user);
      req.user = req.user; // Already set by Passport
      return next();
    }

    // ✅ Else, try JWT from cookie (Email/password login)
    const token = req.cookies.token;
    console.log("Token from cookie:", token);
    console.log("TOKEN_SECRET in middleware:", process.env.TOKEN_SECRET);

    if (!token) {
      return res.status(401).json({ message: "User not authenticated", success: false });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("Decoded token:", decoded);

    req.user = { id: decoded.userId }; // Set req.user for consistency
    next();
  } catch (error) {
    console.error("JWT error:", error);
    return res.status(401).json({ message: "Invalid token", success: false });
  }
};

export default isAuthenticated;
