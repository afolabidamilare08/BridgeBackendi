const Joi = require('joi');


const validator = (schema) => (payload) => schema.validate(payload)


const orderSchema = Joi.object({
    address: Joi.string().min(3).max(70).required(),
    country: Joi.string().min(2).max(40).required(),
    state: Joi.string().min(2).max(40).required(),
    lga: Joi.string().min(2).max(40).required(),
    city: Joi.string().min(2).max(40).required(),
})


exports.validateOrder = validator(orderSchema)