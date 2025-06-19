import jwt from "jsonwebtoken";

const isAdminAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies.adminToken; // use a separate cookie for admins

    console.log("🍪 Admin Token:", token);
    console.log("🔐 TOKEN_SECRET:", process.env.TOKEN_SECRET);

    if (!token) {
      return res.status(401).json({ message: "Admin not authenticated", success: false });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    // Set role & ID to req.user for future authorization
    req.user = {
      id: decoded.adminId,
      role: "admin"
    };

    console.log("✅ Admin verified:", decoded);
    next();
  } catch (err) {
    console.error("❌ Admin JWT error:", err.message);
    return res.status(401).json({ message: "Invalid admin token", success: false });
  }
};

export default isAdminAuthenticated;
