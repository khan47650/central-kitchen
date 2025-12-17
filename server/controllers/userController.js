import User from '../models/User.js';
const mongoose = require('mongoose');
export const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};