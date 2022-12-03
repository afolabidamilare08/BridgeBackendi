const mongoose = require('mongoose')


const OrderSchema = new mongoose.Schema({

    order_owner:{ type:String, required:true, },
    order_status:{ type:String, required:true, enum:[ "unpaid", "pending", "in-transit", "delivered" ] },
    order_items:{ type:Array, required:true },
    order_price:{ type:Number, required:true },
    order_address:{ type:String, required:true },
    order_country:{ type:String, required:true },
    order_state:{ type:String, required:true },
    order_city:{ type:String, required:true },
    order_lga:{ type:String, required:true },
    delivery_date:{ type:String, required:true },
    order_delivery_fee:{ type:Number, required:true },
}, {
    timestamps: true
})

const Order = mongoose.model('Order',OrderSchema);

module.exports = Order