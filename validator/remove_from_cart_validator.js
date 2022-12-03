const Joi = require('joi');


const validator = (schema) => (payload) => schema.validate(payload)


const removefromcartSchema = Joi.object({
    product_id: Joi.string().min(3).max(30).required(),
    product_quantity: Joi.number().required(),
})


exports.validateremovefromcart = validator(removefromcartSchema)