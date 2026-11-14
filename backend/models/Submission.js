const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignmentTitle: {
        type: String,
        required: true,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true,
        trim: true
    },
    grade: {
        type: Number,
        min: 0,
        max: 100
    },
    feedback: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['submitted', 'graded', 'revision_requested'],
        default: 'submitted'
    }
}, { timestamps: true });

submissionSchema.index({ student: 1, course: 1 });
submissionSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
