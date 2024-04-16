const mongoose = require("mongoose");

const SclassSchema = new mongoose.Schema({
    sclassName: {
        type: String,
        required: true,
    },
    institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    },
}, { timestamps: true });

module.exports = mongoose.model("Sclass", SclassSchema);

