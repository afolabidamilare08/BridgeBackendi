const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({

    full_name: { type: String, required: true, },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone_number: { type: String, required: true, unique: true },
    profile_image: { type: Object, required: true },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isShopOwner: {
        type: Boolean,
        default: false,
    },
    isLogistics: {
        type: Boolean,
        default: false,
    }

}, {
    timestamps: true
})


module.exports = mongoose.model("User", UserSchema)