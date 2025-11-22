const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { register, login, googleLogin } = require("../controllers/authController");

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
   HELPER: Generate JWT & Redirect
------------------------------ */
function handleOAuthRedirect(req, res) {
  const user = req.user;

  // Fallbacks for missing data
  const name = user.name || "User";
  const email = user.email || "";
  const picture = user.picture || "/default-avatar.png";

  // Create JWT
  const token = jwt.sign(
    { id: user._id, name, email, picture },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "7d" }
  );

  // Redirect to frontend with token & user info
  const redirectUrl = `${process.env.CLIENT_URL}/login?token=${token}&name=${encodeURIComponent(
    name
  )}&email=${encodeURIComponent(email)}&picture=${encodeURIComponent(picture)}`;

  res.redirect(redirectUrl);
}

/* -----------------------------
   GOOGLE LOGIN (PASSPORT FLOW)
------------------------------ */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  handleOAuthRedirect
);

/* -----------------------------
   GITHUB LOGIN (PASSPORT FLOW)
------------------------------ */
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  handleOAuthRedirect
);

module.exports = router;
