const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const cartSchema = new Schema({

    cart_owner:{ type:String, required:true,unique:true },
    cart_products:{ type:Array, required:true },
    cart_total:{ type:Number, required:true }


},{
    timestamps:true
})

const Cart = mongoose.model('Cart',cartSchema);
 
module.exports = Cart