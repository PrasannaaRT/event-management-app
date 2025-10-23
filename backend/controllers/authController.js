// controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Define allowed locations once for validation
const tamilNaduLocations = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli (Trichy)', 'Salem', 
  'Tirunelveli', 'Vellore', 'Thoothukudi (Tuticorin)', 'Erode', 'Thanjavur', 
  'Dindigul', 'Nagercoil', 'Kancheepuram'
];

// --- REGISTRATION LOGIC ---
exports.register = async (req, res) => { // CHANGED: Renamed back to 'register'
  try {
    // 1. Get user input from the request body, including 'location'
    const { name, email, password, role, organizationName, location } = req.body;

    // 2. Validate location
    if (!location || !tamilNaduLocations.includes(location)) {
      return res.status(400).json({ 
        message: `Invalid or missing location. Please choose from: ${tamilNaduLocations.join(', ')}` 
      });
    }

    // 3. Check if a user with that email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create a new user object
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      location, // --- SAVE THE LOCATION ---
      // Only add organizationName if the role is 'organizer'
      ...(role === 'organizer' && { organizationName }),
      // Set verificationStatus default based on role if not explicitly provided
      verificationStatus: role === 'organizer' ? 'pending' : 'verified',
    });

    // 6. Save the user to the database
    await user.save();

    // 7. Generate JWT (adjust payload to include location for client-side access if needed)
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        location: user.location, // --- INCLUDE LOCATION IN PAYLOAD ---
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' }, // Token expires in 3 hours
      (err, token) => {
        if (err) throw err;
        // 8. Send the token and basic user info back to the client
        res.status(201).json({ 
          message: "User registered successfully!", 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            location: user.location, // --- INCLUDE LOCATION IN RESPONSE ---
            organizationName: user.organizationName,
            verificationStatus: user.verificationStatus,
          }
        });
      }
    );

  } catch (error) {
    console.error("Registration error:", error); // Log the full error
    res.status(500).json({ message: "Something went wrong during registration.", error: error.message });
  }
};


// --- LOGIN LOGIC ---
exports.login = async (req, res) => { // CHANGED: Renamed back to 'login'
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
        location: user.location, // --- INCLUDE LOCATION IN PAYLOAD FOR LOGIN ---
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' }, // Token expires in 3 hours
      (err, token) => {
        if (err) throw err;
        // 5. Send the token and basic user info back to the client
        res.status(200).json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            location: user.location, // --- INCLUDE LOCATION IN RESPONSE ---
            organizationName: user.organizationName, // Include for consistency
            verificationStatus: user.verificationStatus, // Include for consistency
          }
        });
      }
    );

  } catch (error) {
    console.error("Login error:", error); // Log the full error
    res.status(500).json({ message: "Something went wrong during login.", error: error.message });
  }
};