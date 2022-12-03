const Joi = require('joi');


const validator = (schema) => (payload) => schema.validate(payload)

const categorySchema = Joi.object({

    category_name: Joi.string().min(2).max(20).required(),
    category_description: Joi.string().min(2).max(400).required(),

})

exports.validateCategory = validator(categorySchema)