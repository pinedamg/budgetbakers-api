// /home/mpineda/Work/projects/node/budgetbakers-api/src/controllers/auth.controller.js
const authService = require('../services/authService');
const { formatSuccessResponse } = require('../helpers/responseFormatter.helper');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json(formatSuccessResponse(null, 'Email and password are required.'));
    }

    const cookiesToSet = await authService.loginAndRetrieveCookies(email, password);

    cookiesToSet.forEach(cookie => {
      // Map tough-cookie SameSite to Express (Express uses boolean or 'strict', 'lax', 'none')
      let expressSameSite = cookie.options.sameSite;
      if (expressSameSite && typeof expressSameSite === 'string') {
        expressSameSite = expressSameSite.toLowerCase();
        if (!['strict', 'lax', 'none'].includes(expressSameSite)) {
            expressSameSite = 'lax'; // Default or handle error
        }
      } else {
        expressSameSite = 'lax'; // Default if not specified or not a string
      }

      res.cookie(cookie.name, cookie.value, { ...cookie.options, sameSite: expressSameSite });
    });

    res.status(200).json(formatSuccessResponse({ message: 'Login successful. Session cookie set.' }));
  } catch (error) {
    // Ensure the error handler middleware catches this
    next(error);
  }
};