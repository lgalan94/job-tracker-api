const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const {
  register,
  login,
  googleLogin,
} = require("../controllers/authController");

const router = express.Router();

/* -----------------------------
   EMAIL + PASSWORD AUTH
------------------------------ */
router.post("/register", register);
router.post("/login", login);

/* -----------------------------
   GOOGLE LOGIN (Frontend Token)
------------------------------ */
router.post("/google", googleLogin);

/* -----------------------------
   GOOGLE LOGIN (PASSPORT FLOW)
------------------------------ */

// Begin Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user; // Passport user

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture || "",
      },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    // Redirect to frontend with full user info
    const redirectUrl = `${process.env.CLIENT_URL}/login?token=${token}&name=${encodeURIComponent(
      user.name
    )}&email=${encodeURIComponent(user.email)}&picture=${encodeURIComponent(user.picture || "")}`;

    res.redirect(redirectUrl);
  }
);


module.exports = router;
