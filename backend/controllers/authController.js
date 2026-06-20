const User      = require("../models/User");
const bcrypt    = require("bcrypt");
const jwt       = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Nodemailer transporter
// ─────────────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Generate random alphanumeric password (for drivers)
// ─────────────────────────────────────────────────────────────────────────────
const generateRandomPassword = (length = 8) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Send OTP email
// ─────────────────────────────────────────────────────────────────────────────
const sendOtpEmail = async (email, otp, name) => {
  await transporter.sendMail({
    from:    `"Transport System" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1e3a5f;margin-bottom:4px">Password Reset</h2>
        <p style="color:#6b7280;margin-top:0">Hi ${name},</p>
        <p style="color:#374151">Your OTP for password reset is:</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
          <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#1e3a5f">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px">This OTP is valid for <b>10 minutes</b>. Do not share it with anyone.</p>
        <p style="color:#6b7280;font-size:13px">If you didn't request this, ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px;margin:0">University Transport Management System</p>
      </div>
    `,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Send welcome email to STUDENT (login = enrollment, password = enrollment)
// ─────────────────────────────────────────────────────────────────────────────
const sendStudentWelcomeEmail = async (email, name, enrollmentNumber) => {
  await transporter.sendMail({
    from:    `"University Transport" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: "Welcome to University Transport Management System",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1e3a5f;margin-bottom:4px">Congratulations, ${name}!</h2>
        <p style="color:#374151">You have successfully been registered in the <b>University Transport Management System</b>.</p>
        <p style="color:#374151">You can log in using your enrollment number, which was provided to you by the university. Your password is the same as your enrollment number.</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:4px 0;color:#374151"><b>Enrollment Number (Login ID):</b> ${enrollmentNumber}</p>
          <p style="margin:4px 0;color:#374151"><b>Password:</b> ${enrollmentNumber}</p>
        </div>
        <p style="color:#6b7280;font-size:13px">We recommend changing your password after your first login.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px;margin:0">University Transport Management System</p>
      </div>
    `,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Send credentials email to DRIVER (auto-generated password)
// ─────────────────────────────────────────────────────────────────────────────
const sendDriverCredentialsEmail = async (email, name, plainPassword) => {
  await transporter.sendMail({
    from:    `"University Transport" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: "Your Driver Account — University Transport Management System",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1e3a5f;margin-bottom:4px">Welcome, ${name}!</h2>
        <p style="color:#374151">Your driver account has been created on the <b>University Transport Management System</b>.</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:4px 0;color:#374151"><b>Login Email:</b> ${email}</p>
          <p style="margin:4px 0;color:#374151"><b>Password:</b> ${plainPassword}</p>
        </div>
        <p style="color:#6b7280;font-size:13px">Please change your password after your first login. Do not share this with anyone.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px;margin:0">University Transport Management System</p>
      </div>
    `,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, enrollmentNumber, userId } = req.body;

    if (!name || !email || !phone || !role) {
      return res.status(400).json({ message: "Name, email, phone and role are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let finalPassword = password;
    let plainPasswordForEmail = null;

    if (role === "student") {
      if (!enrollmentNumber) {
        return res.status(400).json({ message: "Enrollment number is required for student" });
      }

      const existingEnrollment = await User.findOne({ enrollmentNumber });
      if (existingEnrollment) {
        return res.status(400).json({ message: "Enrollment number already registered" });
      }

      // Student password = enrollment number (as per university policy)
      finalPassword = enrollmentNumber;
    } else if (role === "driver") {
      // Driver password is auto-generated, not taken from req.body
      finalPassword = generateRandomPassword(8);
      plainPasswordForEmail = finalPassword;
    } else {
      // admin
      if (!password) {
        return res.status(400).json({ message: "Password is required for admin" });
      }
    }

    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      enrollmentNumber: role === "student" ? enrollmentNumber : undefined,
      userId: role === "driver" ? userId : undefined,
    });

    // Fire-and-forget style, but awaited so failures are logged (don't block on email errors)
    try {
      if (role === "student") {
        await sendStudentWelcomeEmail(user.email, user.name, user.enrollmentNumber);
      } else if (role === "driver") {
        await sendDriverCredentialsEmail(user.email, user.name, plainPasswordForEmail);
      }
    } catch (mailErr) {
      console.error("WELCOME/CREDENTIALS EMAIL ERROR:", mailErr);
      // Don't fail registration just because email didn't send
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollmentNumber: user.enrollmentNumber || undefined,
        userId: user.userId || undefined,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, enrollmentNumber, password, role } = req.body;

    let user;

    if (role === "student") {
      if (!enrollmentNumber) {
        return res.status(400).json({ message: "Enrollment number is required" });
      }
      user = await User.findOne({ enrollmentNumber, role: "student" });
    } else {
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: "Wrong role selected" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        enrollmentNumber: user.enrollmentNumber || undefined,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET CURRENT USER
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpires");
    res.status(200).json({ user });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE PASSWORD — old password verify → set new password
// ─────────────────────────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Check new password not same as old
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ message: "New password cannot be same as old password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD — send OTP to email
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists — security best practice
      return res.status(200).json({ message: "If this email exists, an OTP has been sent" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp        = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendOtpEmail(user.email, otp, user.name);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Failed to send OTP. Try again." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY OTP — check OTP before allowing reset
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Request a new one." });
    }

    res.status(200).json({ message: "OTP verified", verified: true });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD — after OTP verified, set new password
// ─────────────────────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Request a new one." });
    }

    // Set new password and clear OTP
    user.password   = await bcrypt.hash(newPassword, 10);
    user.otp        = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE EMAIL — verify password first, then change email
// ─────────────────────────────────────────────────────────────────────────────
exports.updateEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check email not already taken
    const existing = await User.findOne({ email: newEmail });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    user.email = newEmail;
    await user.save();

    res.status(200).json({ message: "Email updated successfully", email: newEmail });
  } catch (error) {
    console.error("UPDATE EMAIL ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};