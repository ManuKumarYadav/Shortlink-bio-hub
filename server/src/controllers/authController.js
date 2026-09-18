const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

const isProd = process.env.NODE_ENV === "production";

const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isEmailVerified: false,
      verificationToken: hashedVerificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const verificationLink = `${serverUrl}/api/auth/verify-email/${verificationToken}`;

    return res.status(201).json({
      success: true,
      message: "Account created successfully. Please verify your email.",
      verificationToken,
      verificationLink,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password +refreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return res
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", refreshToken, refreshCookieOptions)
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const refreshToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || !user.refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh session",
      });
    }

    const tokenMatch = await bcrypt.compare(oldRefreshToken, user.refreshToken);
    if (!tokenMatch) {
      user.refreshToken = null;
      await user.save();
      return res.status(401).json({
        success: false,
        message: "Refresh token reuse detected",
      });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    return res
      .cookie("accessToken", newAccessToken, accessCookieOptions)
      .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
      .status(200)
      .json({
        success: true,
        message: "Token refreshed successfully",
        accessToken: newAccessToken,
      });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      } catch {
        // Token was invalid or expired; proceed with clearing cookies
      }
    }

    return res
      .clearCookie("accessToken", accessCookieOptions)
      .clearCookie("refreshToken", refreshCookieOptions)
      .status(200)
      .json({
        success: true,
        message: "Logout successful",
      });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+resetPasswordToken +resetPasswordExpires"
    );

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a reset link has been generated",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "If an account exists with this email, a reset link has been generated",
      resetToken,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires +refreshToken");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.refreshToken = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please login again.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token || req.body.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired email verification token",
      });
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    if (req.method === "GET") {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Email Verified | ShortHub</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #080b11; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: rgba(17, 24, 39, 0.85); padding: 2.5rem; border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.3); text-align: center; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
              h2 { color: #10b981; margin-top: 0; }
              a { display: inline-block; margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #6366f1; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>✓ Email Verified!</h2>
              <p>Your email has been successfully verified.</p>
              <a href="${clientUrl}/login">Sign In to ShortHub</a>
            </div>
          </body>
        </html>
      `);
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
};