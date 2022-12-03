const mongoose = require('mongoose')


const ShopSchema = new mongoose.Schema({

    shop_owner: { type: String, required: true, unique: true },
    shop_name: { type: String, required: true, unique: true },
    shop_description: { type: String, required: true },
    shop_country: { type: String, required: true },
    shop_state: { type: String, required: true },
    shop_lga: { type: String, required: true },
    shop_address: { type: String, required: true },
    shop_email: { type: String, required: true, unique: true },
    shop_phoneNumber: { type: String, required: true, unique: true },
    shop_products: { type: Array, required: true },
    shop_image: { type: Array, required: false }

}, {
    timestamps: true
})


module.exports = mongoose.model("Shop", ShopSchema)