const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    contentType: {
        type: String,
        enum: ['video', 'text', 'quiz'],
        required: true
    },
    contentUrl: {
        type: String,
        required: function() {
            return this.contentType === 'video';
        },
        trim: true
    },
    duration: {
        type: Number,
        min: 0
    },
    orderIndex: {
        type: Number,
        required: true
    }
});

const moduleSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    orderIndex: {
        type: Number,
        required: true
    },
    lessons: {
        type: [lessonSchema],
        default: []
    }
}, { timestamps: true });

moduleSchema.index({ course: 1, orderIndex: 1 });

module.exports = mongoose.model('Module', moduleSchema);
