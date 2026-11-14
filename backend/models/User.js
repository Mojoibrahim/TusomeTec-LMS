// models/User.js
const mongoose = require('mongoose');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^https?:\/\/\S+$/i;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [emailPattern, 'Email must be a valid email address']
    },
    password: {
        type: String,
        // Allows local login to enforce passwords while letting OAuth bypass it
        required: function() {
            return !this.googleId && !this.facebookId && !this.tiktokId;
        },
        minlength: [8, 'Password must be at least 8 characters long']
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
        required: true,
        default: 'New User',
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long']
    },
    firstName: { type: String, trim: true, maxlength: 100 },
    secondName: { type: String, trim: true, maxlength: 100 },
    lastName: { type: String, trim: true, maxlength: 100 },
    preferredName: { type: String, trim: true, maxlength: 100 },
    dateOfBirth: { type: Date },
    gender: { type: String, trim: true, maxlength: 50 },
    countryOfOrigin: { type: String, trim: true, maxlength: 100 },
    countryOfResidence: { type: String, trim: true, maxlength: 100 },
    streetOfResidence: { type: String, trim: true, maxlength: 200 },
    countyOfResidence: { type: String, trim: true, maxlength: 100 },
    postalCode: { type: String, trim: true, maxlength: 30 },
    phoneNumber: { type: String, trim: true, maxlength: 30 },
    profilePicture: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        trim: true,
        match: [urlPattern, 'Avatar must be a valid HTTP or HTTPS URL']
    },
    isActive: {
        type: Boolean,
        default: true
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

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema, 'Users');