const Joi = require('joi');


const validator = (schema) => (payload) => schema.validate(payload)


const productSchema = Joi.object({
    product_name: Joi.string().min(3).max(30).required(),
    product_description: Joi.string().min(4).max(1000).required(),
    product_price: Joi.number().required(),
    // product_quantity: Joi.number().required(),
    product_category: Joi.string().required(),
    product_images: Joi.array().required(),
    // available: Joi.boolean().required(),
})


exports.validateProduct = validator(productSchema)