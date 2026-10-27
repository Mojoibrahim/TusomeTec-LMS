// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        // Allows local login to enforce passwords while letting OAuth bypass it
        required: function() {
            return !this.googleId && !this.facebookId && !this.tiktokId;
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true
    },
    tiktokId: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        default: 'New User',
        trim: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    department: {
        type: String,
        default: 'Unassigned'
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'instructor', 'student'],
            message: '{VALUE} is not a valid role'
        },
        default: 'student'
    },
    enrolledCourses: {
        type: [String],
        default: []
    },
    className: {
        type: String,
        trim: true
    },
    enrollmentDate: {
        type: Date
    },
    checkedIn: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);