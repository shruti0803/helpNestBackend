import jwt from 'jsonwebtoken';

const isHelperAuthenticated = (req, res, next) => {
  try {
    // 1️⃣ Check Passport session (Google login)
    if (req.isAuthenticated?.()) {
      console.log("✅ Helper authenticated via session (Google login):", req.user);
      req.helper = req.user; // Passport sets req.user after deserialize
      return next();
    }

    // 2️⃣ Check JWT token from cookies (email/password login)
    const token = req.cookies.helper_token;
    if (!token) {
      return res.status(401).json({ message: "Helper not authenticated", success: false });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    if (decoded.role !== 'helper') {
      return res.status(403).json({ message: "Access denied: Not a helper", success: false });
    }

    req.helper = { id: decoded.userId, role: decoded.role };
    next();

  } catch (error) {
    console.error("JWT helper auth error:", error.message || error);
    return res.status(401).json({ message: "Invalid or expired token", success: false });
  }
};

export default isHelperAuthenticated;
