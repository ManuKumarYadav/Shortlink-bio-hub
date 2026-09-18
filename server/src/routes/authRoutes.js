const express = require("express");

const {
  signup,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/refresh", refreshToken);

router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.get("/verify-email/:token", verifyEmail);
router.post("/verify-email", verifyEmail);

module.exports = router;