const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    thumbnail: {
        type: String,
        required: true,
        trim: true,
        match: [/^https?:\/\/\S+$/i, 'Thumbnail must be a valid HTTP or HTTPS URL']
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });

module.exports = mongoose.model('Course', courseSchema);
