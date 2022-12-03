const Joi = require('joi');


const validator = (schema) => (payload) => schema.validate(payload)

const vehicleSchema = Joi.object({

    vehicle_name: Joi.string().min(2).max(20).required(),
    vehicle_description: Joi.string().min(2).max(400).required(),

})

exports.validateVehicle = validator(vehicleSchema)