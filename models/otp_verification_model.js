const mongoose = require('mongoose')

const OtpSchema = new mongoose.Schema({

    user_id: { type: String, required: true, unique: true },
    otp: { type: Number, required: true, unique: true },
}, {
    timestamps: true
})


module.exports = mongoose.model("Otp", OtpSchema)