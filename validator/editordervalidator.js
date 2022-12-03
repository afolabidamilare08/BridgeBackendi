const Joi = require('joi');


const validator = (schema) => (payload) => schema.validate(payload)


const editorderSchema = Joi.object({
    status: Joi.string().min(3).max(70).required(),
})


exports.validatereditOrder = validator(editorderSchema)