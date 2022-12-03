const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const addressSchema = new Schema({

    user:{ type:String, required:true,unique:true },
    address:{ type:String, },
    country:{ type:String,  },
    state:{ type:String, },
    city:{ type:String, },
    lga:{ type:String, },
},{
    timestamps:true
})

const Address = mongoose.model('Address',addressSchema);
 
module.exports = Address