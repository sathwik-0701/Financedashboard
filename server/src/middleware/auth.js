const { verifyAuthToken } = require('../utils/tokens');
const User = require('../models/User');

const COOKIE_NAME = 'fd_token';

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
}

module.exports = { requireAuth, COOKIE_NAME };
