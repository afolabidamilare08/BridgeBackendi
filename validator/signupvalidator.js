const Joi = require('joi');


const validator = (schema) => (payload) => schema.validate(payload)

 
const signupSchema = Joi.object({
    full_name: Joi.string().min(4).max(30).required(),
    username: Joi.string().min(4).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(30).required(),
    confirmPassword: Joi.ref("password"),
    phone_number: Joi.number().required()
})


exports.validateSignup = validator(signupSchema)