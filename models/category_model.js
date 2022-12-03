const mongoose = require('mongoose')


const categorySchema = new mongoose.Schema({

    category_name:{ type:String, required:true, unique:true },
    category_description:{ type:String, required:true },

})


const Categories = mongoose.model('Categories',categorySchema);

module.exports = Categories 