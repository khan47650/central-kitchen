const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Simple refreshToken implementation: validate refresh token (if provided)
// and issue a new access token. This is a minimal implementation to
// satisfy the routes and should be extended for production use.
exports.refreshToken = async (req, res) => {
  try {
    // Try to read refresh token from cookies or body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    // Verify refresh token using REFRESH_SECRET if available
    const secret = process.env.REFRESH_SECRET || 'refresh-secret';
    let payload;
    try {
      payload = jwt.verify(refreshToken, secret);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Optionally, you can lookup the user in DB to ensure token still valid
    const user = await User.findById(payload.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Issue a new access token
    const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_SECRET || 'access-secret', { expiresIn: '15m' });

    return res.json({ accessToken });
  } catch (err) {
    console.error('refreshToken error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
