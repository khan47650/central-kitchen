// server/routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const multer = require("multer");


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});


// Example route
router.get('/', (req, res) => {
  res.json({ message: 'User route working ✅' });
});

//get all users
router.get('/all', async (req, res) => {
  try {

    const users = await User.find().select('-password');
    res.json(users);

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }

});

//get pending users
router.get('/pending', async (req, res) => {
  try {

    const users = await User.find({ status: 'pending' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }

});

//awaiting users
router.put('/awaiting/:id', async (req, res) => {
  try {

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'awaiting' },
      { new: true }

    );
    res.json({ message: "User approved successfully", user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }

});


//get awaiting users
router.get('/awaiting', async (req, res) => {
  try {

    const users = await User.find({ status: 'awaiting' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }

});

//Approve user
router.put('/approved/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });


    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved"
      },
      { new: true }
    );

    // Send email
    const html = `
      <h2>Your Central Kitchen account has been approved!</h2>
      <p>You can now log in using:</p>
      <p><b>Email:</b> ${user.email}</p>
      <p><b>Password:</b> ${user.password}</p>
    `;
    await sendEmail(user.email, "Your Central Kitchen Account Approved", html);

    res.json({
      message: "User approved & credentials sent",
      user: updatedUser
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// UPDATE PASSWORD 
router.put('/update-password/:id', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Update password 
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { password: newPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



//freez user
router.put('/freez/:id', async (req, res) => {
  try {

    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({ message: "Email subject and remarks are required" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "freezed" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f9fafb; padding:24px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:24px;">

      <h2 style="color:#991b1b; margin-bottom:16px;">
        Account Temporarily Frozen
      </h2>

      <p style="color:#374151; font-size:14px; line-height:1.6;">
        This is to inform you that your account has been temporarily frozen.
      </p>

      <div style="background:#fef2f2; border-left:4px solid #dc2626; padding:12px; margin:16px 0;">
        <p style="margin:0; color:#7f1d1d; font-size:14px;">
          ${remarks}
        </p>
      </div>

      <p style="color:#374151; font-size:14px; line-height:1.6;">
        Please review the above information carefully.
      </p>

      <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />

      <p style="color:#6b7280; font-size:13px;">
        For further information or clarification, please contact us at
        <a href="mailto:commissary@centralaz.edu" style="color:#2563eb; text-decoration:none;">
          commissary@centralaz.edu
        </a>
      </p>

      <p style="color:#9ca3af; font-size:12px; margin-top:24px;">
        © Central Kitchen. All rights reserved.
      </p>

    </div>
  </div>
`;


    await sendEmail(user.email, " Account Temporarily Frozen", html);

    res.json({ message: "User freezed successfully", user });

  } catch (err) {
    res.statusCode(500).json({ message: "Server error" });
  }

});

//unfreez user
router.put('/unfreez/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subject = "Your Central Kitchen Account Has Been Reactivated";

    const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f9fafb; padding:24px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:24px;">

      <h2 style="color:#111827; margin-bottom:16px;">
        Account Reactivated
      </h2>

      <p style="color:#374151; font-size:14px; line-height:1.6;">
        We are pleased to inform you that your account has been successfully reactivated.
      </p>

      <p style="color:#374151; font-size:14px; line-height:1.6;">
        You may now log in and continue using <strong>Central Kitchen</strong> services without any restrictions.
      </p>

      <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />

      <p style="color:#6b7280; font-size:13px;">
        If you have any questions or need further assistance, please contact us at
        <a href="mailto:commissary@centralaz.edu" style="color:#2563eb; text-decoration:none;">
          commissary@centralaz.edu
        </a>
      </p>

      <p style="color:#9ca3af; font-size:12px; margin-top:24px;">
        © Central Kitchen. All rights reserved.
      </p>

    </div>
  </div>
`;


    await sendEmail(user.email, subject, html);
    res.json({ message: 'User unfreezed successfully', user });

  } catch (err) {
    res.status(500).json({ message: "Srver error" });
  }

});

//Get Freezed Users
router.get('/freezed', async (req, res) => {
  try {
    const users = await User.find({ status: 'freezed' }).select('-password');
    res.json(users);

  } catch (err) {
    res.statusCode(500).json({ message: "Server error" });
  }

});

//reject user
router.put('/reject/:id', async (req, res) => {
  try {

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }

    );

    res.json({ message: "User rejected successfully", user });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });

  }
});


//generate randomPassword

const generatePassword = () => {
  return crypto.randomBytes(4).toString('hex');
};

//forgot password
router.post('/forgot-password', async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(404).json({ message: "email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    const newPassword = generatePassword();

    user.password = newPassword;
    await user.save();

    const html = `
      <h2>Central Kitchen - Password Reset</h2>
      <p>Your password has been reset successfully.</p>
      <p><b>Email:</b> ${user.email}</p>
      <p><b>New Password:</b> ${newPassword}</p>
      <p>Please login and change your password immediately.</p>
    `;

    await sendEmail(
      user.email,
      "Central Kitchen - New Password",
      html
    );

    res.json({ message: "New password sent to your email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }

});

router.post("/send-announcement",
  upload.array("files"), 
  async (req, res) => {
    try {
      const { subject, description } = req.body;

      if (!subject || !description) {
        return res.status(400).json({
          message: "Subject and description are required",
        });
      }

      const users = await User.find({ status: "approved" }).select("email");

      if (!users.length) {
        return res.status(404).json({ message: "No users found" });
      }

      const html = `
        <div style="font-family:Arial; background:#f9fafb; padding:20px">
          <div style="max-width:600px; background:#fff; margin:auto; padding:20px; border-radius:8px">
            <h2 style="color:#111827">${subject}</h2>
            <p style="color:#374151; font-size:14px; line-height:1.6">
              ${description}
            </p>
            <hr />
            <p style="font-size:13px; color:#6b7280">
              Contact:
              <a href="mailto:commissary@centralaz.edu">
                commissary@centralaz.edu
              </a>
            </p>
          </div>
        </div>
      `;

      const attachments = req.files
        ? req.files.map(file => ({
            filename: file.originalname,
            content: file.buffer,
          }))
        : [];

      for (const user of users) {
        await sendEmail(user.email, subject, html, attachments);
      }

      res.json({ message: "Announcement sent successfully" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);





module.exports = router;