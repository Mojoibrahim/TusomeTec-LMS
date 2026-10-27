// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');
const { registerUser, loginUser, verifyOTP, getOAuthSession } = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const uploadProfilePicture = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            return callback(new Error('Profile picture must be a JPEG, PNG, or WebP image'));
        }
        callback(null, true);
    }
}).single('profilePicture');

const parseProfilePicture = (req, res, next) => {
    uploadProfilePicture(req, res, (error) => {
        if (!error) return next();
        const status = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        return res.status(status).json({ message: error.message });
    });
};

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.get('/oauth-session', getOAuthSession);

router.put('/profile', protect, parseProfilePicture, async(req, res) => {
    try {
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const department = typeof req.body.department === 'string' ? req.body.department.trim() : '';

        if (!name || name.length > 100) {
            return res.status(400).json({ message: 'Name must be between 1 and 100 characters' });
        }
        if (!department || department.length > 100) {
            return res.status(400).json({ message: 'Department must be between 1 and 100 characters' });
        }

        req.user.name = name;
        req.user.department = department;
        if (req.file) {
            req.user.profilePicture = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }
        await req.user.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                role: req.user.role,
                department: req.user.department,
                profilePicture: req.user.profilePicture
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Failed to update profile' });
    }
});

router.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            return res.status(200).json({ message: 'Successfully logged out' });
        });
    } else {
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logged out successfully' });
    }
});

// Admin-Only Routes
router.get('/admin/users', protect, authorize('admin'), async(req, res) => {
    try {
        const users = await User.find().select('-password -otp -otpExpiry');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Instructor & Admin Shared Routes
router.get('/courses/manage', protect, authorize('instructor', 'admin'), (req, res) => {
    res.json({ message: 'Instructor course management dashboard content' });
});

// Student, Instructor, & Admin Accessible Route
router.get('/student/profile', protect, authorize('student', 'instructor', 'admin'), (req, res) => {
    res.json({ message: `Access granted for ${req.user.role}`, user: req.user });
});

module.exports = router;