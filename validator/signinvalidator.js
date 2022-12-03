const Joi = require('joi');


const validator = (schema) => (payload) => schema.validate(payload)


const signinSchema = Joi.object({
    username: Joi.string().min(4).max(30).required(),
    password: Joi.string().min(4).max(30).required(),
})


exports.validateSignin = validator(signinSchema)