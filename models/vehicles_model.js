const mongoose = require('mongoose')


const VehicleSchema = new mongoose.Schema({

    vehicle_name: { type: String, required: true, unique: [true, "Vehicle already exists"] },
    vehicle_description: { type: String, required: true },

}, {
    timestamps: true
})


const Vehicles = mongoose.model("Vehicle", VehicleSchema)

module.exports = Vehicles