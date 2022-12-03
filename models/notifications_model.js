const mongoose = require('mongoose')

const Notifications = new mongoose.Schema({

    user_id: { type: String, required: true, unique: true },
    status: { type: Boolean, required: true},
    user_notifications:{ type: Array, required:true } 
}, {
    timestamps: true
})


module.exports = mongoose.model("Notifications", Notifications)