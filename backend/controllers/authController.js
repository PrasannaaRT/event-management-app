// controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTRATION LOGIC ---
exports.register = async (req, res) => {
  try {
    // 1. Get user input from the request body
    const { name, email, password, role, organizationName } = req.body;

    // 2. Check if a user with that email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create a new user object
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      // Only add organizationName if the role is 'organizer'
      ...(role === 'organizer' && { organizationName }),
    });

    // 5. Save the user to the database
    await user.save();

    // 6. Send a success response
    res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};


// --- LOGIN LOGIC ---
exports.login = async (req, res) => {
  try {
    // 1. Get user input
    const { email, password } = req.body;

    // 2. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // 3. Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    
    // 4. If credentials are correct, create a JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' }, // Token expires in 3 hours
      (err, token) => {
        if (err) throw err;
        // 5. Send the token back to the client
        res.status(200).json({ token });
      }
    );

  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};