// server/routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const crypto=require('crypto');

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
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "freezed" },
      { new: true }
    );

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

    res.json({ message: 'User unfreezed successfully', user });

  } catch (err) {
    res.status(500).json({ message: "Srver error" });
  }

});

//Get Freezed Users
router.get('/freezed',async(req,res)=>{
  try{
    const users=await User.find({status:'freezed'}).select('-password');
    res.json(users);

  }catch(err){
    res.statusCode(500).json({message:"Server error"});
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

const generatePassword=()=>{
  return crypto.randomBytes(4).toString('hex');
};

//forgot password
router.post('/forgot-password',async(req,res)=>{
  try{

    const {email}=req.body;

    if(!email){
      return res.status(404).json({message:"email is required"});
    }

    const user=await User.findOne({email});

    if(!user){
      return res.status(404).json({message:"Email not registered"});
    }

    const newPassword=generatePassword();

    user.password=newPassword;
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

  }catch(error){
  console.error(error);
    res.status(500).json({ message: "Server error" });
  }
  
});



module.exports = router;