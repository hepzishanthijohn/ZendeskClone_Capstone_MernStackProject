const mongoose = require("mongoose")

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "Admin"
    },
    institutionName: {
        type: String,
        unique: true,
        required: true
    }
});

module.exports = mongoose.model("admin", AdminSchema)