const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const productSchema = new Schema({


    shop: { type: String, required: true },
    shop_owner: { type: String, required: true },
    product_name: { type: String, required: true, unique: true },
    product_description: { type: String, required: true },
    product_price: { type: String, required: true },
    // product_quantity:{ type:Number, required:true },
    available: { type: Boolean, required: true, default: true },
    product_category: { type: String, required: true },
    product_images: { type: Array, required: true }

}, {
    timestamps: true
})


const Product = mongoose.model('Product', productSchema);

module.exports = Product