const nodemailer = require("nodemailer");

const sendEmail = async ({ to, name, email, password, role }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // safety fallback
    const safeName = name || "User";
    const safeEmail = email || "N/A";
    const safePassword = password || "N/A";
    const safeRole = role || "user";

    const mailOptions = {
      from: `"RUTMS 🚍" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🚍 RUTMS Account Created Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          
          <h2 style="color: #2c3e50;">🚍 Welcome to RUTMS</h2>

          <p>Dear <strong>${safeName}</strong>,</p>

          <p>
            🎉 Congratulations! You have been successfully registered as a 
            <strong>${safeRole.toUpperCase()}</strong> in 
            <b>RUTMS (Road Transport Management System)</b>.
          </p>

          <hr/>

          <h3>🔐 Your Login Details</h3>
          <p><b>Email (Your User ID):</b> ${safeEmail}</p>
          <p><b>Password:</b> ${safePassword}</p>

          <hr/>

          <p style="color: #e67e22;">
            ⚠️ For security reasons, we strongly recommend changing your password after your first login.
          </p>

          <p>
            👉 You can change your password using the <b>"Forgot Password"</b> option on the login page.
          </p>

          <hr/>

          <p>
            💬 If you have any queries, complaints, or need support, feel free to contact us anytime.
          </p>

          <p>
            🙏 Thank you for choosing <b>RUTMS</b>. We are happy to have you onboard!
          </p>

          <br/>

          <p>Best Regards,</p>
          <p><b>RUTMS Team 🚍</b></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Email sent to ${safeEmail}`);
  } catch (error) {
    console.error(" Email Error:", error);
  }
};

module.exports = sendEmail;