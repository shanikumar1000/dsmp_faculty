const { auth } = require('../firebase/config');

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log('📝 Login attempt received');
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${role}`);

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role are required',
      });
    }

    console.log('✅ Login validation successful (mock response)');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        email,
        role,
        token: 'mock_token_' + Date.now(),
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

module.exports = { login };
