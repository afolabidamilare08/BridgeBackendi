const Joi = require('joi');


const validator = (schema) => (payload) => schema.validate(payload)

const logisticsSchema = Joi.object({

    logistics_name: Joi.string().min(4).max(30).required(),
    logistics_description: Joi.string().min(4).max(400).required(),
    logistics_vehicles: Joi.array().min(1).required(),
    logistics_coverage: Joi.array().min(1).required(),
    logistics_country: Joi.string().min(4).max(30).required(),
    logistics_state: Joi.string().min(2).max(30).required(),
    logistics_lga: Joi.string().min(2).max(30).required(),
    logistics_address: Joi.string().min(2).required(),
    logistics_email: Joi.string().email().required(),
    logistics_phoneNumber: Joi.number().required(),
    logistics_image: Joi.array().required().length(1),

})


exports.validateLogistics = validator(logisticsSchema)