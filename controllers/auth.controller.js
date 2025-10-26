const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config(); 
const crypto = require("crypto");
const { User } = require("../models");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// Helper function to send verification emails
async function sendVerificationEmail(email, name, verificationLink) {
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL,
    subject: 'Welcome to Zaptalk! Please Verify Your Email',
    html: `<p>Hi ${name},</p>
           <p>Thank you for registering at Zaptalk! Please verify your email by clicking the link below:</p>
           <a href="${verificationLink}">Verify My Email</a>
           <p>This link will expire in 1 hour.</p>
           <p>If you did not sign up for Zaptalk, please ignore this email.</p>
           <p>Best regards,<br/>The Zaptalk Team</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Verification email sent successfully to:', email);
  } catch (err) {
    console.error('❌ Error sending verification email:');
    console.error(err.response?.body || err.message || err);
    throw new Error('Failed to send verification email');
  }
}


async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email, and password are required" });
    }

    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Generate a random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash it before saving
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Set expiry (1 hour from now)
    const expiry = Date.now() + 60 * 60 * 1000; 

    // Create user
    const user = new User({
      name,
      email,
      password: hash,
      verificationToken: hashedToken,
      verificationTokenExpires: expiry,
    });

    // Save user
    await user.save();

    // Build verification link
    const verificationLink = `${process.env.APP_URL}/auth/verify-email?token=${rawToken}`;

    // Send verification email
    await sendVerificationEmail(email, name, verificationLink);

    return res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}


async function verifyEmail(req, res) {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Hash token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with this token and still valid
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ error: "Token is invalid or expired" });
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (err) {
    console.error('Email verification error:', err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}


async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email already verified. Please log in." });
    }

    // Generate a new token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiry = Date.now() + 60 * 60 * 1000;

    user.verificationToken = hashedToken;
    user.verificationTokenExpires = expiry;
    await user.save();

    const verificationLink = `${process.env.APP_URL}/auth/verify-email?token=${rawToken}`;

    // Send verification email
    await sendVerificationEmail(email, user.name, verificationLink);

    return res.json({ message: "Verification email resent. Please check your inbox." });
  } catch (err) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}


async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ error: "Please verify your email before logging in." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, friends: user.friends },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}


// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};


const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "No token provided" });
    }

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID.trim(),
    });

    const payload = ticket.getPayload();
    const { name, email, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // Create new user if not exists
      const randomPassword = crypto.randomBytes(16).toString("hex");
      user = new User({
        name,
        email,
        password: randomPassword,
        avatar: picture,
        isVerified: true // Google-authenticated users are auto-verified
      });
      await user.save();
      isNewUser = true;
    }

    const appToken = generateToken(user);

    return res.status(isNewUser ? 201 : 200).json({
      success: true,
      token: appToken,
      message: isNewUser ? "Account created successfully" : "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};


async function test(req, res) {
  try {
    const testEmail = "blaqboydee@gmail.com";
    const testLink = `${process.env.APP_URL}/auth/verify-email?token=test123`;
    
    await sendVerificationEmail(testEmail, "Test User", testLink);

    res.json({ message: "Test email sent successfully!" });
  } catch (err) {
    console.error("Email error details:", {
      message: err.message,
      code: err.code,
      response: err.response,
    });
    res.status(500).json({ error: "Email failed to send" });
  }
}


module.exports = { 
  register, 
  login, 
  test, 
  googleLogin, 
  verifyEmail, 
  resendVerificationEmail 
};