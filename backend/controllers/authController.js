// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendOTPEmail = require('../utils/sendEmail');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Registration Controller
exports.registerUser = async(req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = generateOTP();

    // Allow selection of role, but ensure it adheres to valid values; fallback to 'student'
        const assignedRole = ['admin', 'instructor', 'student'].includes(role) ? role : 'student';

        const newUser = new User({
            email,
            password: hashedPassword,
            name: name || 'New User',
            department: 'Data Annotation',
            role: assignedRole,
            otp: otp,
            otpExpiry: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        await newUser.save();

        if (process.env.NODE_ENV !== 'test') {
            await sendOTPEmail(email, otp);
        }

        res.status(201).json({
            message: 'Registration successful. Please verify your OTP.',
            requiresOTP: true,
            email: newUser.email
        });
    } catch (error) {
        console.error('Error in register route:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login Controller
exports.loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        if (process.env.NODE_ENV !== 'test') {
            await sendOTPEmail(user.email, otp);
        }

        res.status(200).json({
            message: 'Credentials valid. OTP sent to email.',
            requiresOTP: true,
            email: user.email
        });
    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// OTP Verification Controller
exports.verifyOTP = async(req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user || user.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        user.otp = null;
        user.otpExpiry = null;
        user.isVerified = true;
        await user.save();

        if (req.session) {
            req.session.userId = user._id.toString();
        }

    // Include role directly into JWT token payload
        const token = jwt.sign({ id: user._id, role: user.role },
            process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Authentication successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                department: user.department,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error('Error in verify route:', error);
        res.status(500).json({ error: 'Server error during verification' });
    }
};

// Complete OAuth sign-in by issuing the same JWT and user data used by the frontend guard.
exports.getOAuthSession = (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: 'Not authenticated with an OAuth provider' });
    }

    const user = {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        department: req.user.department,
        profilePicture: req.user.profilePicture
    };
    const token = jwt.sign({ id: user.id, role: user.role },
        process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1d' }
    );

    return res.status(200).json({ token, user });
};