const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
    },
    courseCode: {
        type: String,
        required: true,
    },
    sessions: {
        type: String,
        required: true,
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    },
    Mentors: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'mentors',
    },
    coordinators: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
    }

}, { timestamps: true });

module.exports = mongoose.model("course", courseSchema);