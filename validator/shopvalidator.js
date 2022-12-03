const Joi = require('joi');


const validator = (schema) => (payload) => schema.validate(payload)

const shopSchema = Joi.object({

    shop_name: Joi.string().min(4).max(30).required(),
    shop_description: Joi.string().min(4).max(400).required(),
    shop_country: Joi.string().min(4).max(30).required(),
    shop_state: Joi.string().min(2).max(30).required(),
    shop_lga: Joi.string().min(2).max(30).required(),
    shop_address: Joi.string().min(2).required(),
    shop_email: Joi.string().email().required(),
    shop_phoneNumber: Joi.number().required(),

})


exports.validateShop = validator(shopSchema)