const mongoose = require('mongoose')

const LogisticsSchema = new mongoose.Schema({

    logistics_owner: { type: String, required: true, unique: true },
    logistics_name: { type: String, required: true, unique: true },
    logistics_description: { type: String, required: true },
    logistics_vehicles: { type: Array, required: true },
    logistics_country: { type: String, required: true },
    logistics_state: { type: String, required: true },
    logistics_lga: { type: String, required: true },
    logistics_address: { type: String, required: true },
    logistics_coverage: { type: Array, required: true },
    logistics_email: { type: String, required: true, unique: true },
    logistics_phoneNumber: { type: String, required: true, unique: true},
    logistics_image: { type: Array, required: true }

}, {
    timestamps: true
})


const Logistics = mongoose.model("Logistics", LogisticsSchema)

module.exports = Logistics